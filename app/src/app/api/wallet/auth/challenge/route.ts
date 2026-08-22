import { bytesToBase64Url } from "@/lib/crypto/base64";
import { CHALLENGE_KV_TTL_SEC, CHALLENGE_TTL_MS } from "@/lib/server/agent-policy";
import { apiJson } from "@/lib/server/api-response";
import {
  putWalletAuthChallenge,
  type WalletAuthChallenge,
} from "@/lib/server/wallet-auth-store";
import { toUserErrorMessage } from "@/lib/user-errors";

export const runtime = "nodejs";

/** Mint a WebAuthn challenge for wallet-owner API calls (agent bind / revoke). */
export async function POST() {
  try {
    const requestId = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
    const challengeBytes = crypto.getRandomValues(new Uint8Array(32));
    const challenge = bytesToBase64Url(challengeBytes);
    const now = Date.now();
    const stored: WalletAuthChallenge = {
      requestId,
      challenge,
      createdAtMs: now,
      expiresAtMs: now + CHALLENGE_TTL_MS,
      consumed: false,
    };
    await putWalletAuthChallenge(stored, CHALLENGE_KV_TTL_SEC);
    return apiJson({
      requestId,
      challenge,
      expiresAtMs: stored.expiresAtMs,
    });
  } catch (error) {
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t start") }, 500);
  }
}
