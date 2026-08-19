import "server-only";

import { NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { toUserErrorMessage } from "@/lib/user-errors";
import { getErrorMessage } from "@/lib/utils";
import {
  getHmacSecret,
  getPreauthGrantsStub,
  isApiKeyAuthError,
} from "@/lib/server/preauth-grants-do";
import { openedPreauthCopy } from "../../../shared/preauth-status";
import { INVALID_API_KEY, parseApiKey } from "../../../worker/api-key-hmac";
import { PREAUTH_TTL_SECONDS } from "../../../worker/preauth-grant-types";

/** GET /api/preauth/open — HMAC-parse key, open a spending window on the DO. */
export async function openPreauthGrant(params: {
  apiKey: string;
}): Promise<NextResponse> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Query param apiKey is required" },
      { status: 400, headers: QUERY_NO_STORE },
    );
  }

  try {
    const parsed = await parseApiKey(getHmacSecret(), apiKey);
    if (!parsed) {
      return NextResponse.json(
        { error: INVALID_API_KEY },
        { status: 401, headers: QUERY_NO_STORE },
      );
    }

    const grant = await getPreauthGrantsStub(parsed.wallet).open({
      gen: parsed.gen,
    });

    return NextResponse.json(
      {
        expiresAt: grant.expiresAt,
        grantId: grant.id,
        wallet: parsed.wallet,
        ...openedPreauthCopy(PREAUTH_TTL_SECONDS),
      },
      { headers: QUERY_NO_STORE },
    );
  } catch (error) {
    const message = getErrorMessage(error, "Internal error");
    if (isApiKeyAuthError(message)) {
      return NextResponse.json(
        { error: message },
        { status: 401, headers: QUERY_NO_STORE },
      );
    }
    const status = message.includes("rate limited") ? 429 : 500;
    return NextResponse.json(
      { error: toUserErrorMessage(error, message) },
      { status, headers: QUERY_NO_STORE },
    );
  }
}
