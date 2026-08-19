import { NextRequest } from "next/server";

import { openPreauthGrant } from "@/lib/server/open-preauth-grant";

/**
 * GET /api/preauth/open?apiKey=&amount=100000000
 * In-app Pay and integrators — apiKey in query string.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  return openPreauthGrant({
    apiKey: params.get("apiKey") ?? "",
    amount: params.get("amount"),
    mint: params.get("mint"),
  });
}
