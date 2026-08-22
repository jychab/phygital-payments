import { base64UrlToBytes, bytesToBase64Url } from "@/lib/crypto/base64";
import { apiJson } from "@/lib/server/api-response";
import { putPasskeyMapping } from "@/lib/server/passkey-map";
import {
  requireWalletSession,
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/lib/server/wallet-session";
import {
  resolveWalletFromCredential,
  WalletAuthError,
  walletAuthErrorMessage,
} from "@/lib/server/wallet-auth";
import { toUserErrorMessage } from "@/lib/user-errors";

export const runtime = "nodejs";

/** Persist credentialId → pubkey for server-side Face ID verification. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      credentialId?: string;
      compressedPubkey?: string;
    };
    if (!body.credentialId || !body.compressedPubkey) {
      return apiJson({ error: "Missing passkey fields" }, 400);
    }

    const wallet = await requireWalletSession();
    const credentialId = base64UrlToBytes(body.credentialId);
    const compressedPubkey = base64UrlToBytes(body.compressedPubkey);
    if (compressedPubkey.length !== 33) {
      return apiJson({ error: "Bad public key" }, 400);
    }

    const resolved = await resolveWalletFromCredential(
      credentialId,
      compressedPubkey,
    );
    if (String(resolved.vaultPda) !== String(wallet.vaultPda)) {
      return apiJson({ error: "Sign in again" }, 403);
    }
    if (
      bytesToBase64Url(resolved.compressedPubkey) !==
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
}
