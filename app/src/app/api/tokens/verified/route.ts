import { NextResponse } from "next/server";

import { fetchVerifiedTokens } from "@/lib/server/verified-tokens";

/**
 * GET /api/tokens/verified — Jupiter verified classic-SPL catalog (USDC pinned).
 * Cached for 1 hour at the edge when possible.
 */
export async function GET() {
  const tokens = await fetchVerifiedTokens();
  return NextResponse.json(
    { tokens },
    {
      headers: {
        // Catalog can change with deploys (e.g. USDC icon); avoid long shared caches.
        "Cache-Control": "private, max-age=300, stale-while-revalidate=3600",
      },
    },
  );
}
