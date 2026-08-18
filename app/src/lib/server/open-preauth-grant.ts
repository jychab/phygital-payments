import "server-only";

import { NextResponse } from "next/server";

import { tryParseAddress } from "@/lib/payments/payment-request";
import { getDefaultMint } from "@/lib/payments/payment-token";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { getErrorMessage } from "@/lib/utils";
import { getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import {
  getWalletApiKeysDb,
  verifyPayApiKey,
} from "@/lib/server/wallet-api-keys-db";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export type OpenPreauthParams = {
  apiKey: string;
  amount?: string | null;
  mint?: string | null;
};

/**
 * Verify API key + raw amount/mint and create a preauth grant in the payer's DO.
 * Mint defaults to USDC. Mint validity and delegate caps are enforced at collect.
 */
export async function openPreauthGrant(
  params: OpenPreauthParams,
): Promise<NextResponse> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Query param apiKey is required" },
      { status: 400, headers: NO_STORE },
    );
  }

  const maxAmount = params.amount?.trim() || "";
  if (!maxAmount) {
    return NextResponse.json(
      { error: "Query param amount (raw u64) is required" },
      { status: 400, headers: NO_STORE },
    );
  }
  if (!/^\d+$/.test(maxAmount) || maxAmount === "0") {
    return NextResponse.json(
      { error: "amount must be a positive raw u64 decimal string" },
      { status: 400, headers: NO_STORE },
    );
  }

  const mintParam = params.mint?.trim() || "";
  const mintAddress = mintParam
    ? tryParseAddress(mintParam)
    : getDefaultMint();
  if (!mintAddress) {
    return NextResponse.json(
      { error: "mint must be a valid Solana address" },
      { status: 400, headers: NO_STORE },
    );
  }
  const mint = String(mintAddress);

  try {
    const wallet = await verifyPayApiKey(getWalletApiKeysDb(), apiKey);
    if (!wallet) {
      return NextResponse.json(
        { error: "Invalid or revoked API key" },
        { status: 401, headers: NO_STORE },
      );
    }

    const grant = await getPreauthGrantsStub(wallet).open({
      wallet,
      maxAmount,
      mint,
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
    if (message.includes("Invalid or revoked API key")) {
      return NextResponse.json(
        { error: message },
        { status: 401, headers: NO_STORE },
      );
    }
    const status = message.includes("rate limited") ? 429 : 500;
    return NextResponse.json(
      { error: toUserErrorMessage(error, message) },
      { status, headers: NO_STORE },
    );
  }
}
