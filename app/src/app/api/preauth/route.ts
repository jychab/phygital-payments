import { NextRequest, NextResponse } from "next/server";

import { getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import { verifyPayKey } from "../../../../worker/pay-hmac";
import { getErrorMessage } from "@/lib/utils";

function getHmacSecret(): string {
  const secret = process.env.PAY_HMAC_SECRET?.trim();
  if (!secret) throw new Error("PAY_HMAC_SECRET is not configured");
  return secret;
}

/**
 * DELETE /api/preauth
 * Authorization: Bearer <HMAC pay key>
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

    const parsed = await verifyPayKey(getHmacSecret(), match[1].trim());
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid or revoked Pay key" },
        { status: 401 },
      );
    }

    await getPreauthGrantsStub(parsed.wallet).cancel();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Internal error") },
      { status: 500 },
    );
  }
}
