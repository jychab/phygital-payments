import { base64UrlToBytes, bytesToBase64Url } from "@/shared/base64";
import { withApiMetrics } from "@/platform/analytics";
import { apiJson } from "@/platform/api-response";
import { rateLimitOrResponse, rateLimitPresets } from "@/platform/rate-limit";
import { putPasskeyMapping } from "@/wallet/passkey-map";
import {
  WalletAuthError,
  walletAuthErrorMessage,
  type WalletAuthAssertionWire,
} from "@/wallet/auth";
import { requireWalletAuthStepUp } from "@/wallet/auth-step-up";
import {
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/wallet/session";
import { toUserErrorMessage } from "@/platform/user-errors";

/** Persist credentialId → pubkey for server-side Face ID verification. */
export async function POST(req: Request) {
  return withApiMetrics("/api/wallet/passkey", async () => {
    try {
      const limited = await rateLimitOrResponse(
        req,
        rateLimitPresets.walletWrite,
      );
      if (limited) return limited;

      const body = (await req.json()) as {
        walletAuth?: WalletAuthAssertionWire;
        credentialId?: string;
        compressedPubkey?: string;
      };
      const wallet = await requireWalletAuthStepUp(req, body.walletAuth);
      const limitedVault = await rateLimitOrResponse(
        req,
        rateLimitPresets.walletWrite,
        `passkey:${String(wallet.vaultPda)}`,
      );
      if (limitedVault) return limitedVault;

      if (!body.credentialId || !body.compressedPubkey) {
        return apiJson({ error: "Missing passkey fields" }, 400);
      }
      if (
        body.walletAuth?.credentialId &&
        body.walletAuth.credentialId !== body.credentialId
      ) {
        return apiJson({ error: "Sign in again" }, 403);
      }

      const credentialId = base64UrlToBytes(body.credentialId);
      const compressedPubkey = base64UrlToBytes(body.compressedPubkey);
      if (compressedPubkey.length !== 33) {
        return apiJson({ error: "Bad public key" }, 400);
      }
      if (
        bytesToBase64Url(wallet.compressedPubkey) !==
        bytesToBase64Url(compressedPubkey)
      ) {
        return apiJson({ error: "Bad public key" }, 400);
      }

      await putPasskeyMapping({ credentialId, compressedPubkey });
      return apiJson({ ok: true });
    } catch (error) {
      if (error instanceof WalletSessionError) {
        return apiJson({ error: walletSessionErrorMessage(error) }, 401);
      }
      if (error instanceof WalletAuthError) {
        return apiJson({ error: walletAuthErrorMessage(error) }, 401);
      }
      return apiJson(
        { error: toUserErrorMessage(error, "Save failed") },
        500,
      );
    }
  });
}
