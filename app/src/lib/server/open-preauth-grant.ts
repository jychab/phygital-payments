import "server-only";

import { NextResponse } from "next/server";

import { tryParseAddress } from "@/lib/payments/payment-request";
import { getDefaultMint } from "@/lib/payments/payment-token";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { getErrorMessage } from "@/lib/utils";
import { getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import { verifyPayKey } from "../../../worker/pay-hmac";

const NO_STORE = { "Cache-Control": "no-store" } as const;

function getHmacSecret(): string {
  const secret = process.env.PAY_HMAC_SECRET?.trim();
  if (!secret) throw new Error("PAY_HMAC_SECRET is not configured");
  return secret;
}

export type OpenPreauthParams = {
  apiKey: string;
  amount?: string | null;
  mint?: string | null;
};

/**
 * Verify the HMAC pay key from the `apiKey` query param, then open a preauth
 * grant in the payer's DO. Mint defaults to USDC.
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
    const parsed = await verifyPayKey(getHmacSecret(), apiKey);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid or revoked Pay key" },
        { status: 401, headers: NO_STORE },
      );
    }

    const grant = await getPreauthGrantsStub(parsed.wallet).open({
      wallet: parsed.wallet,
      gen: parsed.gen,
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
    if (
      message.includes("Invalid or revoked Pay key") ||
      message.includes("Key has been revoked")
    ) {
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
