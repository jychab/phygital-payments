import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import {
  getHmacSecret,
  getPreauthGrantsStub,
  isApiKeyAuthError,
} from "@/lib/server/preauth-grants-do";
import { getErrorMessage } from "@/lib/utils";
import { INVALID_API_KEY, parseApiKey } from "../../../../worker/api-key-hmac";

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(auth);
    if (!match?.[1]) {
      return NextResponse.json(
        { error: "Missing Authorization: Bearer <api_key>" },
        { status: 401, headers: QUERY_NO_STORE },
      );
    }

    const parsed = await parseApiKey(getHmacSecret(), match[1].trim());
    if (!parsed) {
      return NextResponse.json(
        { error: INVALID_API_KEY },
        { status: 401, headers: QUERY_NO_STORE },
      );
    }
    await getPreauthGrantsStub(parsed.wallet).cancel({ gen: parsed.gen });
    return NextResponse.json({ ok: true }, { headers: QUERY_NO_STORE });
  } catch (error) {
    const message = getErrorMessage(error, "Internal error");
    return NextResponse.json(
      { error: message },
      {
        status: isApiKeyAuthError(message) ? 401 : 500,
        headers: QUERY_NO_STORE,
      },
    );
  }
}
