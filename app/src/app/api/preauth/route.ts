import { NextRequest, NextResponse } from "next/server";

import {
  getWalletApiKeysDb,
  verifyPayApiKey,
} from "@/lib/server/wallet-api-keys-db";
import { getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import { getErrorMessage } from "@/lib/utils";

/**
 * DELETE /api/preauth
 * Authorization: Bearer <wallet api key>
 *
 * Cancels any open spending window for the wallet (Pay panel Cancel).
 */
export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(auth);
    if (!match?.[1]) {
      return NextResponse.json(
        { error: "Missing Authorization: Bearer <api_key>" },
        { status: 401 },
      );
    }

    const wallet = await verifyPayApiKey(getWalletApiKeysDb(), match[1].trim());
    if (!wallet) {
      return NextResponse.json(
        { error: "Invalid or revoked API key" },
        { status: 401 },
      );
    }

    await getPreauthGrantsStub(wallet).cancel();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal error") },
      { status: 500 },
    );
  }
}
