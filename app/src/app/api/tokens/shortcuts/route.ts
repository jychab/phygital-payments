import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { fetchCollectibleShortcuts } from "@/lib/tokens/shortcuts";

/**
 * GET ?externalUrl=&collectionMint=
 * Proxies Phantom `{externalUrl}/shortcuts.json` — always 200 with shortcuts[].
 */
export async function GET(req: NextRequest) {
  const externalUrl = req.nextUrl.searchParams.get("externalUrl")?.trim() ?? "";
  const collectionMint =
    req.nextUrl.searchParams.get("collectionMint")?.trim() || null;

  if (!externalUrl.startsWith("https://")) {
    return NextResponse.json(
      { shortcuts: [] },
      { headers: QUERY_NO_STORE },
    );
  }

  const shortcuts = await fetchCollectibleShortcuts(
    externalUrl,
    collectionMint,
  );
  return NextResponse.json({ shortcuts }, { headers: QUERY_NO_STORE });
}
