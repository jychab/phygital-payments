import { NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { fetchVerifiedTokens } from "@/lib/server/verified-tokens";

/**
 * GET /api/tokens/verified — full Jupiter classic-SPL catalog (USDC pinned).
 * Collect picker and Activity resolve mints that may not be in the wallet.
 * Pay uses holdings from `/api/pay/bootstrap` instead.
 */
export async function GET() {
  const tokens = await fetchVerifiedTokens();
  return NextResponse.json({ tokens }, { headers: QUERY_NO_STORE });
}
