import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { tryParseAddress } from "@/lib/solana/address";
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
    return NextResponse.json({ collectible }, { headers: QUERY_NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load collectible") },
      { status: 502 },
    );
  }
}
