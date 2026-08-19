import { NextRequest, NextResponse } from "next/server";

import { tryParseAddress } from "@/lib/solana/address";
import { fetchVerifiedHoldings } from "@/lib/server/token-holdings";

/**
 * GET /api/tokens/holdings?owner= — wallet fungibles ∩ verified classic SPL.
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
    const holdings = await fetchVerifiedHoldings(owner);
    return NextResponse.json(
      { holdings },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load holdings";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
