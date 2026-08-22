import { getCloudflareContext } from "@opennextjs/cloudflare";
import { verifyResponse } from "phygital-token-sdk";

import {
  fetchMaybePhygitalTokenByPasskey,
  isUnclaimedToken,
} from "@/lib/phygital/token";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { getSponsoredFeePayerAddress } from "@/lib/solana/simulate-sponsored";
import { corsJson, corsOptions } from "@/lib/server/api-response";
import {
  decodeAndAssertSignTransaction,
  SignTransactionError,
} from "@/lib/server/agent-sign";
import {
  getChallenge,
  getMappingByPhygitalPasskey,
  takeChallenge,
} from "@/lib/server/agent-store";
import { liveSessionPdas } from "@/lib/server/agent-session-live";
import { signAgentTransaction } from "@/lib/server/session-sign";
import { toUserErrorMessage } from "@/lib/user-errors";

export const runtime = "nodejs";

const SIGN_KEYS = new Set(["requestId", "response", "transaction"]);

export function OPTIONS() {
  return corsOptions("POST, OPTIONS");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return corsJson({ error: "Missing request." }, 400);
    }
    if (Object.keys(body).some((key) => !SIGN_KEYS.has(key))) {
      return corsJson({ error: "Unexpected fields." }, 400);
    }
    if (typeof body.requestId !== "string" || !body.requestId) {
      return corsJson({ error: "Missing request or tap confirmation." }, 400);
    }
    if (body.response == null) {
      return corsJson({ error: "Missing request or tap confirmation." }, 400);
    }
    if (typeof body.transaction !== "string" || !body.transaction) {
      return corsJson({ error: "Missing transaction." }, 400);
    }

    const stored = await getChallenge(body.requestId);
    if (!stored || stored.consumed) {
      return corsJson({ error: "This request expired." }, 410);
    }
    if (Date.now() >= stored.expiresAtMs) {
      return corsJson({ error: "This request expired." }, 410);
    }

    const verified = verifyResponse({
      expectedMessage: stored.challenge,
      response: body.response as Parameters<typeof verifyResponse>[0]["response"],
    });
    if (!verified.isVerified || !verified.secp256r1PublicKey) {
      return corsJson({ error: "Couldn’t verify this phygital token." }, 400);
    }

    const phygitalPasskey = verified.secp256r1PublicKey.trim();
    const [token, mapping] = await Promise.all([
      fetchMaybePhygitalTokenByPasskey(getSolanaRpc(), phygitalPasskey),
      getMappingByPhygitalPasskey(phygitalPasskey),
    ]);
    if (!token || isUnclaimedToken(token)) {
      return corsJson({ error: "This phygital token isn’t claimed." }, 403);
    }

    if (!mapping) {
      return corsJson(
        { error: "Other apps can’t use this token. Turn it on in Settings first." },
        403,
      );
    }
    if (mapping.kind !== "nfc") {
      return corsJson({ error: "This agent doesn’t use NFC signing." }, 403);
    }
    if (mapping.vaultPda !== String(token.currentOwner)) {
      return corsJson({ error: "This phygital token isn’t on that wallet." }, 403);
    }
    const liveSessions = await liveSessionPdas([mapping.sessionPda]);
    if (!liveSessions.has(mapping.sessionPda)) {
      return corsJson({ error: "This allowance has ended." }, 403);
    }

    const asserted = await decodeAndAssertSignTransaction(
      body.transaction,
      {
        walletPda: mapping.walletPda,
        vaultPda: mapping.vaultPda,
        sessionPda: mapping.sessionPda,
        sessionPublicKey: mapping.sessionPublicKey,
      },
      getSponsoredFeePayerAddress(),
    );

    const consumed = await takeChallenge(body.requestId);
    if (!consumed) {
      return corsJson({ error: "This request expired." }, 410);
    }

    const env = getCloudflareContext().env;
    const transaction = await signAgentTransaction({
      env,
      sessionSecret: mapping.sessionSecret,
      sessionPublicKey: mapping.sessionPublicKey,
      feePayer: String(asserted.feePayer),
      transaction: asserted.transaction,
    });
    return corsJson({ transaction });
  } catch (error) {
    if (error instanceof SignTransactionError) {
      return corsJson({ error: error.message }, 400);
    }
    return corsJson({ error: toUserErrorMessage(error, "Couldn’t sign") }, 500);
  }
}
