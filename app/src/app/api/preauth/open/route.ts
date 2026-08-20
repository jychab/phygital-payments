import { NextRequest } from "next/server";

import { openPreauthGrant } from "@/lib/server/open-preauth-grant";
import { apiKeyFromHeader } from "../../../../../worker/api-key-hmac";

/**
 * GET /api/preauth/open
 * In-app Pay and integrators — `x-api-key: <api_key>`.
 * JSON includes `body` for a Shortcuts notification, including errors.
 */
export async function GET(req: NextRequest) {
  return openPreauthGrant({
    apiKey: apiKeyFromHeader(req.headers),
  });
}
