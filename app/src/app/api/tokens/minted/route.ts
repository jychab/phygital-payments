import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { tryParseAddress } from "@/lib/solana/address";
import { loadMintedCollectibleView } from "@/lib/server/minted-collectible-view";
import { getErrorMessage } from "@/lib/utils";

/**
 * Minted `/token` landing payload — collectible + rarity + shortcuts in one hop.
 */
export async function GET(req: NextRequest) {
  const idRaw = req.nextUrl.searchParams.get("id")?.trim() ?? "";
  const id = tryParseAddress(idRaw);
  if (!id) {
    return NextResponse.json(
      { error: "Query param id must be a valid Solana address" },
      { status: 400 },
    );
  }

  try {
    const view = await loadMintedCollectibleView(id);
    return NextResponse.json(view, { headers: QUERY_NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load collectible view") },
      { status: 502, headers: QUERY_NO_STORE },
    );
  }
}
