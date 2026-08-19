import { NextRequest } from "next/server";

import { openPreauthGrant } from "@/lib/server/open-preauth-grant";

/**
 * GET /api/preauth/open?apiKey=
 * In-app Pay and integrators — apiKey in query string.
 */
export async function GET(req: NextRequest) {
  return openPreauthGrant({
    apiKey: req.nextUrl.searchParams.get("apiKey") ?? "",
  });
}
