import { bytesToBase64Url } from "@/shared/base64";

import { withApiMetrics } from "@/lib/server/analytics";
import { apiJson } from "@/lib/server/api-response";
import { rateLimitOrResponse, rateLimitPresets } from "@/lib/server/rate-limit";
import {
  assertWalletAuthAssertion,
  assertWalletRegistration,
  WalletAuthError,
  walletAuthErrorMessage,
  type ResolvedWalletSession,
  type WalletAuthAssertionWire,
  type WalletRegistrationWire,
} from "@/lib/server/wallet-auth";
import { takeWalletAuthChallenge } from "@/lib/server/wallet-auth-store";
import {
  clearWalletSessionCookieOptions,
  readWalletSessionFromCookies,
  serializeCookie,
  walletSessionCookieOptions,
  walletSessionErrorMessage,
} from "@/lib/server/wallet-session";
import { getCookie, withSetCookie } from "@/lib/server/request-context";
import { signWalletSessionJwt, revokeWalletSessionToken, WALLET_SESSION_COOKIE } from "@/lib/server/wallet-session-jwt";
import { toUserErrorMessage } from "@/lib/user-errors";

async function issueSessionResponse(wallet: ResolvedWalletSession) {
  const token = await signWalletSessionJwt({
    vaultPda: wallet.vaultPda,
    walletPda: wallet.walletPda,
    authorityPda: wallet.authorityPda,
    jti: bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16))),
  });
  return withSetCookie(
    apiJson({
      vaultPda: String(wallet.vaultPda),
      walletPda: String(wallet.walletPda),
      authorityPda: String(wallet.authorityPda),
      compressedPubkey: bytesToBase64Url(wallet.compressedPubkey),
    }),
    serializeCookie(walletSessionCookieOptions(token)),
  );
}

/** Face ID → HttpOnly JWT bound to this wallet. */
export async function POST(req: Request) {
  return withApiMetrics("/api/wallet/session", async () => {
  try {
    const limited = await rateLimitOrResponse(req, rateLimitPresets.publicWrite);
    if (limited) return limited;

    const body = (await req.json()) as {
      walletAuth?: WalletAuthAssertionWire;
      walletRegistration?: WalletRegistrationWire;
    };

    if (body.walletRegistration?.requestId) {
      const stored = await takeWalletAuthChallenge(
        body.walletRegistration.requestId,
      );
      if (!stored) {
        throw new WalletAuthError("This expired. Try again.");
      }
      const wallet = await assertWalletRegistration(
        body.walletRegistration,
        stored.challenge,
        req.headers.get("origin"),
      );
      return issueSessionResponse(wallet);
    }

    if (!body.walletAuth?.requestId) {
      throw new WalletAuthError("Confirm with Face ID first.");
    }
    const stored = await takeWalletAuthChallenge(body.walletAuth.requestId);
    if (!stored) {
      throw new WalletAuthError("This expired. Try again.");
    }
    const wallet = await assertWalletAuthAssertion(
      body.walletAuth,
      stored.challenge,
      req.headers.get("origin"),
    );
    return issueSessionResponse(wallet);
  } catch (error) {
    if (error instanceof WalletAuthError) {
      return apiJson({ error: walletAuthErrorMessage(error) }, 401);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t sign in") }, 500);
  }
  });
}

/** Return the wallet bound to the session cookie, if any. */
export async function GET() {
  return withApiMetrics("/api/wallet/session", async () => {
  try {
    const session = await readWalletSessionFromCookies();
    if (!session) return apiJson({ session: null });
    return apiJson({
      session: {
        vaultPda: String(session.vaultPda),
        walletPda: String(session.walletPda),
        authorityPda: String(session.authorityPda),
      },
    });
  } catch (error) {
    return apiJson({ error: walletSessionErrorMessage(error) }, 500);
  }
  });
}

export async function DELETE() {
  return withApiMetrics("/api/wallet/session", async () => {
  try {
    const token = getCookie(WALLET_SESSION_COOKIE);
    if (token) {
      await revokeWalletSessionToken(token);
    }
    return withSetCookie(
      apiJson({ ok: true }),
      serializeCookie(clearWalletSessionCookieOptions()),
    );
  } catch (error) {
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t sign out") }, 500);
  }
  });
}
