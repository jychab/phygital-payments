import "server-only";

import { cookies } from "next/headers";

import {
  verifyWalletSessionJwt,
  WALLET_SESSION_COOKIE,
  WALLET_SESSION_TTL_SEC,
  WalletSessionError,
  type WalletSessionClaims,
} from "./wallet-session-jwt";

export { WalletSessionError, type WalletSessionClaims };

export async function readWalletSessionFromCookies(): Promise<WalletSessionClaims | null> {
  const token = (await cookies()).get(WALLET_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyWalletSessionJwt(token);
  } catch {
    return null;
  }
}

export async function requireWalletSession(): Promise<WalletSessionClaims> {
  const session = await readWalletSessionFromCookies();
  if (!session) {
    throw new WalletSessionError("Sign in again");
  }
  return session;
}

/** Require cookie session and that it matches the requested vault. */
export async function requireVaultSession(
  vaultPda: string,
): Promise<WalletSessionClaims> {
  const session = await requireWalletSession();
  if (String(session.vaultPda) !== vaultPda) {
    throw new WalletSessionError("Sign in again");
  }
  return session;
}

export function walletSessionCookieOptions(token: string) {
  return {
    name: WALLET_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: WALLET_SESSION_TTL_SEC,
  };
}

export function clearWalletSessionCookieOptions() {
  return {
    name: WALLET_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}

export function walletSessionErrorMessage(error: unknown): string {
  if (error instanceof WalletSessionError) return error.message;
  return "Sign in again";
}
