import { NextRequest } from "next/server";

import { openPresenceGrant } from "@/lib/server/open-presence-grant";

/**
 * GET /api/preauth/open?apiKey=&amountUi=100
 * In-app Pay, Shortcuts, and integrators — apiKey in query string.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  return openPresenceGrant({
    apiKey: params.get("apiKey") ?? "",
    amount: params.get("amount"),
    amountUi: params.get("amountUi"),
    mint: params.get("mint"),
  });
}
