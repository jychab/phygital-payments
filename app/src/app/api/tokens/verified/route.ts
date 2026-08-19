import { NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { fetchVerifiedTokens } from "@/lib/server/verified-tokens";

/**
 * GET /api/tokens/verified — Jupiter verified classic-SPL catalog (USDC pinned).
 */
export async function GET() {
  const tokens = await fetchVerifiedTokens();
  return NextResponse.json({ tokens }, { headers: QUERY_NO_STORE });
}
