import { NextRequest, NextResponse } from "next/server";

import {
  getPreauthGrantsStub,
  isApiKeyAuthError,
  requireLiveApiKey,
} from "@/lib/server/preauth-grants-do";
import { getErrorMessage } from "@/lib/utils";

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

    const parsed = await requireLiveApiKey(match[1].trim());
    await getPreauthGrantsStub(parsed.wallet).cancel();
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = getErrorMessage(error, "Internal error");
    return NextResponse.json(
      { error: message },
      { status: isApiKeyAuthError(message) ? 401 : 500 },
    );
  }
}
