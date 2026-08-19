import "server-only";

import { NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { toUserErrorMessage, toUserFacingBody } from "@/lib/user-errors";
import { getErrorMessage } from "@/lib/utils";
import {
  getHmacSecret,
  getPreauthGrantsStub,
  isApiKeyAuthError,
} from "@/lib/server/preauth-grants-do";
import { openedPreauthCopy } from "../../../shared/preauth-status";
import { INVALID_API_KEY, parseApiKey } from "../../../worker/api-key-hmac";
import { PREAUTH_TTL_SECONDS } from "../../../worker/preauth-grant-types";

function errorJson(error: unknown, status: number, errorField?: string) {
  const message =
    errorField ??
    (typeof error === "string"
      ? error
      : getErrorMessage(error, "Internal error"));
  return NextResponse.json(
    { error: message, body: toUserFacingBody(error) },
    { status, headers: QUERY_NO_STORE },
  );
}

/** GET /api/preauth/open — HMAC-parse key, open a spending window on the DO. */
export async function openPreauthGrant(params: {
  apiKey: string;
}): Promise<NextResponse> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    return errorJson("Query param apiKey is required", 400);
  }

  try {
    const parsed = await parseApiKey(getHmacSecret(), apiKey);
    if (!parsed) {
      return errorJson(INVALID_API_KEY, 401);
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
      return errorJson(message, 401, message);
    }
    const status = message.includes("rate limited") ? 429 : 500;
    return errorJson(error, status, toUserErrorMessage(error, message));
  }
}
