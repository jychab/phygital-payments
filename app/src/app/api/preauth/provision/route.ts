import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { getHmacSecret, getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import {
  isWalletSignatureError,
  requireFreshTimestamp,
  requireWalletSignature,
} from "@/lib/server/wallet-signature";
import { getErrorMessage } from "@/lib/utils";
import { signApiKey } from "../../../../../worker/api-key-hmac";

const MESSAGE_PREFIX = "phygital-pay:provision:";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: QUERY_NO_STORE });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      wallet?: string;
      message?: string;
      signature?: string;
    };
    const wallet = body.wallet?.trim();
    const message = body.message?.trim();
    const signatureB64 = body.signature?.trim();

    if (!wallet || !message || !signatureB64) {
      return json(
        { error: "wallet, message, and signature are required" },
        400,
      );
    }

    const prefix = `${MESSAGE_PREFIX}${wallet}:`;
    if (!message.startsWith(prefix)) {
      return json({ error: "Invalid message" }, 400);
    }
    requireFreshTimestamp(message.slice(prefix.length));
    requireWalletSignature({ wallet, message, signatureB64 });

    const { gen } = await getPreauthGrantsStub(wallet).rotate();
    const apiKey = await signApiKey(getHmacSecret(), wallet, gen);
    return json({ wallet, apiKey });
  } catch (error) {
    if (isWalletSignatureError(error)) {
      return json({ error: error.message }, error.status);
    }
    return json({ error: getErrorMessage(error, "Internal error") }, 500);
  }
}
