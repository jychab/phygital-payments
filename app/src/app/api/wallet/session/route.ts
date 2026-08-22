import { cookies } from "next/headers";

import { apiJson } from "@/lib/server/api-response";
import {
  assertWalletAuthAssertion,
  WalletAuthError,
  walletAuthErrorMessage,
  type WalletAuthAssertionWire,
} from "@/lib/server/wallet-auth";
import { takeWalletAuthChallenge } from "@/lib/server/wallet-auth-store";
import {
  clearWalletSessionCookieOptions,
  readWalletSessionFromCookies,
  walletSessionCookieOptions,
  walletSessionErrorMessage,
} from "@/lib/server/wallet-session";
import { signWalletSessionJwt } from "@/lib/server/wallet-session-jwt";
import { toUserErrorMessage } from "@/lib/user-errors";

export const runtime = "nodejs";

/** Face ID → HttpOnly JWT bound to this wallet. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { walletAuth?: WalletAuthAssertionWire };
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
    );
    const token = await signWalletSessionJwt({
      vaultPda: wallet.vaultPda,
      walletPda: wallet.walletPda,
      authorityPda: wallet.authorityPda,
    });
    const cookieStore = await cookies();
    cookieStore.set(walletSessionCookieOptions(token));
    return apiJson({
      vaultPda: String(wallet.vaultPda),
      walletPda: String(wallet.walletPda),
      authorityPda: String(wallet.authorityPda),
    });
  } catch (error) {
    if (error instanceof WalletAuthError) {
      return apiJson({ error: walletAuthErrorMessage(error) }, 401);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t sign in") }, 500);
  }
}

/** Return the wallet bound to the session cookie, if any. */
export async function GET() {
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
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(clearWalletSessionCookieOptions());
    return apiJson({ ok: true });
  } catch (error) {
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t sign out") }, 500);
  }
}
