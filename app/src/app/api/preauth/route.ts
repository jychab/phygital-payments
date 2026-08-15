import { NextRequest, NextResponse } from "next/server";

import {
  getPreauthDb,
  invalidateActiveGrantsForWallet,
  resolveWalletFromApiKey,
} from "@/lib/server/preauth-db";
import { getErrorMessage } from "@/lib/utils";

async function resolveAuthedWallet(
  req: NextRequest,
): Promise<{ wallet: string } | NextResponse> {
  const auth = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  if (!match?.[1]) {
    return NextResponse.json(
      { error: "Missing Authorization: Bearer <api_key>" },
      { status: 401 },
    );
  }

  const db = getPreauthDb();
  const wallet = await resolveWalletFromApiKey(db, match[1].trim());
  if (!wallet) {
    return NextResponse.json({ error: "Invalid or revoked API key" }, { status: 401 });
  }
  return { wallet };
}

/**
 * DELETE /api/preauth
 * Authorization: Bearer <wallet api key>
 *
 * Cancels any open spending window for the wallet (Pay panel Cancel).
 */
export async function DELETE(req: NextRequest) {
  try {
    const authed = await resolveAuthedWallet(req);
    if (authed instanceof NextResponse) return authed;

    await invalidateActiveGrantsForWallet(getPreauthDb(), authed.wallet);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal error") },
      { status: 500 },
    );
  }
}
