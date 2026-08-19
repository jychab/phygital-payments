import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { tryParseAddress } from "@/lib/solana/address";
import {
  isApiKeyAuthError,
  requireLiveApiKey,
} from "@/lib/server/preauth-grants-do";
import { getErrorMessage } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      apiKey?: string;
      owner?: string;
    };
    const apiKey = body.apiKey?.trim() ?? "";
    const owner = body.owner?.trim() ?? "";

    if (!apiKey || !owner) {
      return NextResponse.json(
        { error: "apiKey and owner are required" },
        { status: 400, headers: QUERY_NO_STORE },
      );
    }
    if (!tryParseAddress(owner)) {
      return NextResponse.json(
        { error: "owner must be a valid Solana address" },
        { status: 400, headers: QUERY_NO_STORE },
      );
    }

    const parsed = await requireLiveApiKey(apiKey);
    if (parsed.wallet !== owner) {
      return NextResponse.json(
        { error: "This API key is for a different wallet" },
        { status: 403, headers: QUERY_NO_STORE },
      );
    }

    return NextResponse.json(
      { ok: true, wallet: parsed.wallet },
      { headers: QUERY_NO_STORE },
    );
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
