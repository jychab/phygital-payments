import { bytesToBase64Url } from "@/shared/base64";
import { CHALLENGE_TTL_MS } from "@/wallet/challenge-ttl";
import { withApiMetrics } from "@/platform/analytics";
import { apiJson } from "@/platform/api-response";
import { rateLimitOrResponse, rateLimitPresets } from "@/platform/rate-limit";
import {
  putWalletAuthChallenge,
  type WalletAuthChallenge,
} from "@/wallet/auth-store";
import { toUserErrorMessage } from "@/platform/user-errors";

/** Mint a WebAuthn challenge for wallet-owner API calls (agent bind / revoke). */
export async function POST(req: Request) {
  return withApiMetrics("/api/wallet/auth/challenge", async () => {
    const limited = await rateLimitOrResponse(req, rateLimitPresets.publicWrite);
    if (limited) return limited;

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
      await putWalletAuthChallenge(stored);
      return apiJson({
        requestId,
        challenge,
        expiresAtMs: stored.expiresAtMs,
      });
    } catch (error) {
      return apiJson({ error: toUserErrorMessage(error, "Couldn’t start") }, 500);
    }
  });
}
