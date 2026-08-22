import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { getHmacSecret, getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import {
  isWalletSignatureError,
  requireFreshTimestamp,
  requirePasskeyAssertion,
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
      walletPda?: string;
      credentialId?: string;
      message?: string;
      signature?: string;
      authenticatorData?: string;
      clientDataJSON?: string;
    };
    const wallet = body.wallet?.trim();
    const walletPda = body.walletPda?.trim();
    const credentialId = body.credentialId?.trim();
    const message = body.message?.trim();
    const signatureB64 = body.signature?.trim();
    const authenticatorData = body.authenticatorData?.trim();
    const clientDataJSON = body.clientDataJSON?.trim();

    if (
      !wallet ||
      !walletPda ||
      !credentialId ||
      !message ||
      !signatureB64 ||
      !authenticatorData ||
      !clientDataJSON
    ) {
      return json(
        {
          error:
            "wallet, walletPda, credentialId, message, signature, authenticatorData, and clientDataJSON are required",
        },
        400,
      );
    }

    const prefix = `${MESSAGE_PREFIX}${wallet}:`;
    if (!message.startsWith(prefix)) {
      return json({ error: "Invalid message" }, 400);
    }
    requireFreshTimestamp(message.slice(prefix.length));
    await requirePasskeyAssertion({
      wallet,
      walletPda,
      credentialIdB64: credentialId,
      message,
      authenticatorDataB64: authenticatorData,
      clientDataJSONB64: clientDataJSON,
      signatureB64,
    });

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
