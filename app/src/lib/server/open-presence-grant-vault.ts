import "server-only";

import { NextResponse } from "next/server";

import {
  decryptPreauthVault,
  prfOutputFromBase64,
} from "../../../shared/preauth-vault-crypto";
import {
  parseAmountUiToRaw,
  type OpenPreauthParams,
} from "@/lib/server/open-presence-grant";
import { resolveMintProgram } from "@/lib/payments/mint-delegate";
import { tryParseAddress } from "@/lib/payments/payment-request";
import { getDefaultMint, isDefaultMint } from "@/lib/payments/payment-token";
import { USDC_DECIMALS } from "@/lib/payments/usdc-mint";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { getErrorMessage } from "@/lib/utils";
import {
  createPreauthGrant,
  invalidateActiveGrantsForWallet,
  resolveWalletFromApiKey,
} from "@/lib/server/presence-grants-db";
import type { D1Database } from "../../../worker/presence-grants";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export type PreauthVaultUnlockBody = {
  wallet: string;
  encrypted: string;
  prfOutput: string;
};

async function resolveGrantAmount(
  params: Pick<OpenPreauthParams, "amount" | "amountUi" | "mint">,
): Promise<{ maxAmount: string; mint: string } | NextResponse> {
  const amountRaw = params.amount?.trim() || "";
  const amountUi = params.amountUi?.trim() || "";
  const hasAmount = Boolean(amountRaw);
  const hasAmountUi = Boolean(amountUi);

  if (hasAmount === hasAmountUi) {
    return NextResponse.json(
      { error: "Provide exactly one of amount (raw u64) or amountUi" },
      { status: 400, headers: NO_STORE },
    );
  }

  const mintParam = params.mint?.trim() || "";
  const mintAddress = mintParam ? tryParseAddress(mintParam) : getDefaultMint();
  if (!mintAddress) {
    return NextResponse.json(
      { error: "mint must be a valid Solana address" },
      { status: 400, headers: NO_STORE },
    );
  }
  const mint = String(mintAddress);

  let decimals = USDC_DECIMALS;
  if (!isDefaultMint(mint)) {
    try {
      decimals = (await resolveMintProgram(mintAddress)).decimals;
    } catch (error) {
      return NextResponse.json(
        { error: toUserErrorMessage(error, "That token isn't available") },
        { status: 400, headers: NO_STORE },
      );
    }
  }

  let maxAmount: string;
  try {
    if (hasAmount) {
      if (!/^\d+$/.test(amountRaw) || amountRaw === "0") {
        throw new Error("amount must be a positive raw u64 decimal string");
      }
      maxAmount = amountRaw;
    } else {
      maxAmount = parseAmountUiToRaw(amountUi, decimals);
    }
  } catch (error) {
    return NextResponse.json(
      { error: toUserErrorMessage(error, "Invalid amount") },
      { status: 400, headers: NO_STORE },
    );
  }

  return { maxAmount, mint };
}

/** Decrypt pay key from client vault material (memory only — never returned). */
export async function resolveWalletFromVaultUnlock(
  db: D1Database,
  body: PreauthVaultUnlockBody,
): Promise<string> {
  const wallet = body.wallet.trim();
  const encrypted = body.encrypted.trim();
  const prfOutputB64 = body.prfOutput.trim();
  if (!wallet || !encrypted || !prfOutputB64) {
    throw new Error("wallet, encrypted, and prfOutput are required");
  }

  let apiKey: string;
  try {
    apiKey = await decryptPreauthVault({
      encryptedB64: encrypted,
      prfOutput: prfOutputFromBase64(prfOutputB64),
      wallet,
    });
  } catch {
    throw new Error("Face ID didn't unlock Pay on this phone.");
  }

  const resolved = await resolveWalletFromApiKey(db, apiKey);
  if (resolved !== wallet) {
    throw new Error("Pay key doesn't match this wallet.");
  }
  return wallet;
}

/** In-app Pay — POST body carries localStorage ciphertext + PRF output; server decrypts. */
export async function openPresenceGrantFromVault(
  db: D1Database,
  body: PreauthVaultUnlockBody & {
    amount?: string | null;
    amountUi?: string | null;
    mint?: string | null;
  },
): Promise<NextResponse> {
  const amountResult = await resolveGrantAmount({
    amount: body.amount,
    amountUi: body.amountUi,
    mint: body.mint,
  });
  if (amountResult instanceof NextResponse) return amountResult;

  try {
    const wallet = await resolveWalletFromVaultUnlock(db, body);
    const grant = await createPreauthGrant(db, {
      wallet,
      maxAmount: amountResult.maxAmount,
      mint: amountResult.mint,
    });

    return NextResponse.json(
      {
        expiresAt: grant.expiresAt,
        grantId: grant.id,
        wallet: grant.wallet,
        maxAmount: grant.maxAmount,
        mint: grant.mint,
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    const message = getErrorMessage(error, "Internal error");
    const status =
      message.includes("rate limited") ? 429
      : message.includes("Face ID") || message.includes("Pay key") ? 401
      : 400;
    return NextResponse.json(
      { error: toUserErrorMessage(error, message) },
      { status, headers: NO_STORE },
    );
  }
}

export async function cancelPresenceGrantFromVault(
  db: D1Database,
  body: PreauthVaultUnlockBody,
): Promise<NextResponse> {
  try {
    const wallet = await resolveWalletFromVaultUnlock(db, body);
    await invalidateActiveGrantsForWallet(db, wallet);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: toUserErrorMessage(error, "Couldn't cancel") },
      { status: 401 },
    );
  }
}
