import { verifyResponse } from "phygital-token-sdk";
import { getBase64EncodedWireTransaction } from "@solana/kit";

import { isEligibleNfcAccessory } from "@/lib/phygital/nfc-accessory";
import {
  fetchMaybePhygitalTokenByPasskey,
  isUnclaimedToken,
} from "@/lib/phygital/token";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { getFeePayerAddress } from "@/lib/server/fee-payer";
import { withApiMetrics } from "@/lib/server/analytics";
import { corsJson, corsOptions } from "@/lib/server/api-response";
import {
  decodeAndAssertSignTransaction,
  SignTransactionError,
} from "@/lib/server/agent-sign";
import { getRecordByPhygitalPasskey } from "@/lib/server/agent-store";
import {
  clientIp,
  rateLimitOrResponse,
  rateLimitPresets,
} from "@/lib/server/rate-limit";
import { SIGNER_REQUEST_EXPIRED, SignerError, signerErrorToHttp } from "@/lib/signer/errors";
import { getSignerClient } from "@/lib/signer/get-signer-client";
import { toUserErrorMessage } from "@/lib/user-errors";

const SIGN_KEYS = new Set(["requestId", "response", "transaction"]);

export function OPTIONS() {
  return corsOptions("POST, OPTIONS");
}

export async function POST(req: Request) {
  return withApiMetrics("/api/modifyAndSign", async () => {
    const limited = await rateLimitOrResponse(
      req,
      rateLimitPresets.agentSign,
      `modifyAndSign:${clientIp(req)}`,
      { publicCors: true },
    );
    if (limited) return limited;

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

      const signer = getSignerClient();
      const peek = await signer.peekChallenge(body.requestId);
      if (!peek || peek.consumed) {
        return corsJson({ error: SIGNER_REQUEST_EXPIRED }, 410);
      }

      const verified = verifyResponse({
        expectedMessage: peek.challenge,
        response: body.response as Parameters<typeof verifyResponse>[0]["response"],
      });
      if (!verified.isVerified || !verified.secp256r1PublicKey) {
        return corsJson({ error: "Couldn’t verify this accessory." }, 400);
      }

      const phygitalPasskey = verified.secp256r1PublicKey.trim();
      const [token, record, sponsoredFeePayer] = await Promise.all([
        fetchMaybePhygitalTokenByPasskey(getSolanaRpc(), phygitalPasskey),
        getRecordByPhygitalPasskey(phygitalPasskey),
        getFeePayerAddress(),
      ]);
      if (!token || isUnclaimedToken(token)) {
        return corsJson({ error: "This accessory isn’t claimed." }, 403);
      }

      if (!record) {
        return corsJson(
          { error: "Other apps can’t use this accessory. Set a spending limit first." },
          403,
        );
      }
      if (record.kind !== "nfc") {
        return corsJson({ error: "This accessory doesn’t use tap signing." }, 403);
      }
      if (!isEligibleNfcAccessory(token, record.vaultPda)) {
        return corsJson(
          {
            error: "This accessory isn’t ready for tap to pay.",
          },
          403,
        );
      }

      const asserted = await decodeAndAssertSignTransaction(
        body.transaction,
        {
          walletPda: record.walletPda,
          vaultPda: record.vaultPda,
          sessionPda: record.sessionPda,
          sessionPublicKey: record.sessionPublicKey,
        },
        sponsoredFeePayer,
      );

      const wire = getBase64EncodedWireTransaction(asserted.transaction);
      const { transaction } = await signer.signSession({
        requestId: body.requestId,
        webauthnResponse: body.response,
        transaction: wire,
        sessionPublicKey: record.sessionPublicKey,
        feePayer: String(asserted.feePayer),
      });
      return corsJson({ transaction });
    } catch (error) {
      if (error instanceof SignTransactionError) {
        return corsJson({ error: error.message }, 400);
      }
      if (error instanceof SignerError) {
        const mapped = signerErrorToHttp(error);
        return corsJson({ error: mapped.message }, mapped.status);
      }
      return corsJson({ error: toUserErrorMessage(error, "Couldn’t sign") }, 500);
    }
  });
}
