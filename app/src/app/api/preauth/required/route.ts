import { NextRequest, NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";
import { tryParseAddress } from "@/lib/solana/address";
import { getHmacSecret, getPreauthGrantsStub } from "@/lib/server/preauth-grants-do";
import {
  isWalletSignatureError,
  requireFreshTimestamp,
  requirePasskeyAssertion,
} from "@/lib/server/wallet-signature";
import { getErrorMessage } from "@/lib/utils";
import {
  REQUIRED_MESSAGE_PREFIX,
} from "../../../../../shared/preauth-required";
import {
  API_KEY_HEADER,
  parseApiKey,
  signApiKey,
} from "../../../../../worker/api-key-hmac";

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: QUERY_NO_STORE });
}

/**
 * GET /api/preauth/required?wallet=
 * Confirm Payments flag, and optionally whether `x-api-key` is live (one DO read).
 */
export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet")?.trim() ?? "";
    if (!tryParseAddress(wallet)) {
      return json({ error: "wallet must be a valid Solana address" }, 400);
    }
    const state = await getPreauthGrantsStub(wallet).getPayState();
    const apiKey = req.headers.get(API_KEY_HEADER)?.trim() ?? "";
    let keyOk = false;
    if (apiKey) {
      const parsed = await parseApiKey(getHmacSecret(), apiKey);
      keyOk = Boolean(
        parsed && parsed.wallet === wallet && parsed.gen >= state.generation,
      );
    }
    return json({ required: state.required, keyOk });
  } catch (error) {
    return json({ error: getErrorMessage(error, "Internal error") }, 500);
  }
}

/**
 * POST /api/preauth/required
 * Wallet-sign to turn Confirm Payments on or off.
 * Turning on with no prior key also issues one (`apiKey` in the response).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      wallet?: string;
      walletPda?: string;
      credentialId?: string;
      required?: boolean;
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
    const required = body.required;

    if (
      !wallet ||
      !walletPda ||
      !credentialId ||
      !message ||
      !signatureB64 ||
      !authenticatorData ||
      !clientDataJSON ||
      typeof required !== "boolean"
    ) {
      return json(
        {
          error:
            "wallet, walletPda, credentialId, required, message, signature, authenticatorData, and clientDataJSON are required",
        },
        400,
      );
    }

    const action = required ? "on" : "off";
    const prefix = `${REQUIRED_MESSAGE_PREFIX}${wallet}:${action}:`;
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

    const result = await getPreauthGrantsStub(wallet).setRequired({ required });
    const payload: {
      wallet: string;
      required: boolean;
      apiKey?: string;
    } = { wallet, required: result.required };
    if (result.issued) {
      payload.apiKey = await signApiKey(getHmacSecret(), wallet, result.gen);
    }
    return json(payload);
  } catch (error) {
    if (isWalletSignatureError(error)) {
      return json({ error: error.message }, error.status);
    }
    return json({ error: getErrorMessage(error, "Internal error") }, 500);
  }
}
