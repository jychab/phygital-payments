import { NextRequest } from "next/server";

import { openPresenceGrant } from "@/lib/server/open-presence-grant";

/**
 * GET /api/preauth/open?apiKey=
 *
 * Opens a short-lived presence window. Same path for Shortcuts and in-app Pay.
 * Mint and amount are not part of the grant — Collect + on-chain delegate.
 * API key is accepted as a query param for integrator simplicity — do not log it;
 * responses use Cache-Control: no-store.
 */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  return openPresenceGrant({
    apiKey: params.get("apiKey") ?? "",
  });
}
