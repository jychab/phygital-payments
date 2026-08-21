import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { loadPayBootstrap } from "@/lib/server/pay-bootstrap";
import { tryParseAddress } from "@/lib/solana/address";

/**
 * GET /api/pay/bootstrap?owner= — holdings + owned accessories + SPL delegates.
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
    const bootstrap = await loadPayBootstrap(owner);
    return NextResponse.json(bootstrap, { headers: QUERY_NO_STORE });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load Pay";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
