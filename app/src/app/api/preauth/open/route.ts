import { NextRequest } from "next/server";

import { openPreauthGrant } from "@/lib/server/preauth-open";

/**
 * GET /api/preauth/open?apiKey=&amountUi=20
 *     /api/preauth/open?apiKey=&amount=<raw>&mint=<optional>
 *
 * Opens a short-lived spending window. Same path for Shortcuts and in-app Pay.
 * API key is accepted as a query param for integrator simplicity — do not log it;
 * responses use Cache-Control: no-store.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  return openPreauthGrant({
    apiKey: params.get("apiKey") ?? "",
    amount: params.get("amount"),
    amountUi: params.get("amountUi"),
    mint: params.get("mint"),
  });
}
