import { NextRequest, NextResponse } from "next/server";

import { openPresenceGrant } from "@/lib/server/open-presence-grant";
import { openPresenceGrantFromVault } from "@/lib/server/open-presence-grant-vault";
import { getPreauthDb } from "@/lib/server/presence-grants-db";

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/preauth/open?apiKey=&amountUi=100
 * Shortcuts / integrators — apiKey in query string.
 *
 * POST /api/preauth/open
 * In-app Pay — `{ wallet, encrypted, prfOutput, amountUi|amount, mint? }`.
 * Server decrypts the client vault; plaintext key never returned to the browser.
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      wallet?: string;
      encrypted?: string;
      prfOutput?: string;
      amount?: string;
      amountUi?: string;
      mint?: string;
    };
    if (
      !body.wallet?.trim() ||
      !body.encrypted?.trim() ||
      !body.prfOutput?.trim()
    ) {
      return NextResponse.json(
        { error: "wallet, encrypted, and prfOutput are required" },
        { status: 400, headers: NO_STORE },
      );
    }
    return openPresenceGrantFromVault(getPreauthDb(), {
      wallet: body.wallet.trim(),
      encrypted: body.encrypted.trim(),
      prfOutput: body.prfOutput.trim(),
      amount: body.amount ?? null,
      amountUi: body.amountUi ?? null,
      mint: body.mint ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500, headers: NO_STORE });
  }
}
