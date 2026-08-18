import { NextRequest, NextResponse } from "next/server";

import { cancelPresenceGrantFromVault } from "@/lib/server/open-presence-grant-vault";
import { getPreauthDb } from "@/lib/server/presence-grants-db";

/**
 * POST /api/preauth/cancel
 * In-app cancel — client sends vault material; server decrypts to verify wallet.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      wallet?: string;
      encrypted?: string;
      prfOutput?: string;
    };
    if (
      !body.wallet?.trim() ||
      !body.encrypted?.trim() ||
      !body.prfOutput?.trim()
    ) {
      return NextResponse.json(
        { error: "wallet, encrypted, and prfOutput are required" },
        { status: 400 },
      );
    }
    return cancelPresenceGrantFromVault(getPreauthDb(), {
      wallet: body.wallet.trim(),
      encrypted: body.encrypted.trim(),
      prfOutput: body.prfOutput.trim(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
