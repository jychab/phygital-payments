import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { tryParseAddress } from "@/lib/solana/address";
import { getCollectibleRarityForMint } from "@/lib/server/collection-rarity";
import { fetchDasCollectible } from "@/lib/server/das-collectible";
import { getErrorMessage } from "@/lib/utils";

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
    const collectible = await fetchDasCollectible(id);
    if (!collectible?.collectionMint) {
      return NextResponse.json({ rarity: null }, { headers: QUERY_NO_STORE });
    }

    const rarity = await getCollectibleRarityForMint({
      mint: id,
      collectionMint: collectible.collectionMint,
      attributes: collectible.attributes,
    });

    return NextResponse.json({ rarity }, { headers: QUERY_NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load rarity") },
      { status: 502 },
    );
  }
}
