import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { handlePreauthStatus } from "../../../../../worker/handle-preauth-status";

/**
 * GET /api/preauth/status?apiKey=&grantId=
 * Holds until cancelled, expired, or webhook success.
 */
export async function GET(req: NextRequest) {
  return handlePreauthStatus(req, getCloudflareContext().env);
}
