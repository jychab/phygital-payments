import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { handlePreauthStatus } from "../../../../../worker/handle-preauth-status";
import { withMintDisplayCopy } from "@/lib/server/with-mint-display-copy";

/**
 * GET /api/preauth/status?grantId= (`x-api-key: <api_key>`)
 * Holds until cancelled, replaced, expired, or webhook success.
 * Each JSON includes `body` for a Shortcuts notification, including errors.
 */
export async function GET(req: NextRequest) {
  const res = await handlePreauthStatus(req, getCloudflareContext().env);
  return withMintDisplayCopy(res);
}
