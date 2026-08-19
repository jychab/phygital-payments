import { NextRequest } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { handlePreauthStatus } from "../../../../../worker/handle-preauth-status";
import { withMintDisplayCopy } from "@/lib/server/with-mint-display-copy";

/**
 * GET /api/preauth/status?apiKey=&grantId=
 * Holds until cancelled, expired, or webhook success.
 * Each terminal JSON includes `body` for a Shortcuts notification.
 */
export async function GET(req: NextRequest) {
  const res = await handlePreauthStatus(req, getCloudflareContext().env);
  return withMintDisplayCopy(res);
}
