import { NextRequest, NextResponse } from "next/server";

import { tryParseAddress } from "@/lib/payments/payment-request";
import {
  getPreauthDb,
  walletHasActiveApiKey,
} from "@/lib/server/presence-grants-db";

/**
 * GET /api/preauth/status?wallet=
 * Boolean only — whether this wallet has a non-revoked payment verifier key.
 * Used by /device (no Privy). Does not return key material.
 */
export async function GET(req: NextRequest) {
  const walletParam = req.nextUrl.searchParams.get("wallet")?.trim() ?? "";
  const wallet = tryParseAddress(walletParam);
  if (!wallet) {
    return NextResponse.json(
      { error: "wallet must be a valid Solana address" },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const enabled = await walletHasActiveApiKey(getPreauthDb(), String(wallet));
    return NextResponse.json(
      { enabled },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
