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
    if (!collectible) {
      return NextResponse.json(
        {
          rarity: null,
          status: null,
          collectionMint: null,
          reason: "collectible_not_found",
        },
        { headers: QUERY_NO_STORE },
      );
    }

    if (!collectible.collectionMint) {
      return NextResponse.json(
        {
          rarity: null,
          status: null,
          collectionMint: null,
          reason: "no_collection",
        },
        { headers: QUERY_NO_STORE },
      );
    }

    const result = await getCollectibleRarityForMint({
      mint: id,
      collectionMint: collectible.collectionMint,
      attributes: collectible.attributes,
    });

    return NextResponse.json(
      {
        rarity: result.rarity,
        status: result.status,
        collectionMint: collectible.collectionMint,
        totalSupply: result.totalSupply,
        scanPage: result.scanPage,
        errorMessage: result.errorMessage,
      },
      { headers: QUERY_NO_STORE },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: getErrorMessage(error, "Failed to load rarity"),
        rarity: null,
        status: "failed",
      },
      { status: 502, headers: QUERY_NO_STORE },
    );
  }
}
