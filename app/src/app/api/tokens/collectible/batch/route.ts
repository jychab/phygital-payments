import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { tryParseAddress } from "@/lib/solana/address";
import { fetchDasCollectibles } from "@/lib/server/das-collectible";
import { getErrorMessage } from "@/lib/utils";

const MAX_BATCH = 50;

/**
 * POST { ids: string[] } → { collectibles: Record<mint, Collectible | null> }
 * Used by the owner dashboard binder to avoid N parallel getAsset calls.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const idsRaw =
    body &&
    typeof body === "object" &&
    "ids" in body &&
    Array.isArray((body as { ids: unknown }).ids)
      ? (body as { ids: unknown[] }).ids
      : null;

  if (!idsRaw || idsRaw.length === 0) {
    return NextResponse.json(
      { error: "Body must include a non-empty ids array" },
      { status: 400 },
    );
  }

  if (idsRaw.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `At most ${MAX_BATCH} ids per request` },
      { status: 400 },
    );
  }

    const ids: string[] = [];
  for (const raw of idsRaw) {
    if (typeof raw !== "string") {
      return NextResponse.json(
        { error: "Each id must be a string Solana address" },
        { status: 400 },
      );
    }
    const id = tryParseAddress(raw.trim());
    if (!id) {
      return NextResponse.json(
        { error: `Invalid Solana address: ${raw}` },
        { status: 400 },
      );
    }
    ids.push(String(id));
  }

  try {
    const collectibles = await fetchDasCollectibles(ids);
    return NextResponse.json({ collectibles }, { headers: QUERY_NO_STORE });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Failed to load collectibles") },
      { status: 502 },
    );
  }
}
