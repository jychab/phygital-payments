import { NextRequest, NextResponse } from "next/server";

import { tryParseAddress } from "@/lib/payments/payment-request";
import { fetchPayTokenContext } from "@/lib/server/token-holdings";

const CACHE = {
  "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
} as const;

/**
 * GET /api/tokens/pay-context?owner=
 * Verified catalog + wallet holdings in one request (Jupiter ∥ DAS).
 */
export async function GET(req: NextRequest) {
  const ownerRaw = req.nextUrl.searchParams.get("owner")?.trim() ?? "";
  const owner = tryParseAddress(ownerRaw);
  if (!owner) {
    return NextResponse.json(
      { error: "Query param owner must be a valid Solana address" },
      { status: 400 },
    );
  }

  try {
    const { tokens, holdings } = await fetchPayTokenContext(String(owner));
    return NextResponse.json({ tokens, holdings }, { headers: CACHE });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load pay context";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
