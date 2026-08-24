import {
  verifyWalletSessionJwt,
  WALLET_SESSION_COOKIE,
  WALLET_SESSION_TTL_SEC,
  WalletSessionError,
  type WalletSessionClaims,
} from "./wallet-session-jwt";
import { getCookie, getRequest } from "./request-context";

export { WalletSessionError, type WalletSessionClaims };

function isLocalhostHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]"
  );
}

/** Same-site for cookie purposes (localhost ports; or shared eTLD+1). */
function isSameSiteHost(a: string, b: string): boolean {
  if (a === b) return true;
  if (isLocalhostHost(a) && isLocalhostHost(b)) return true;
  const ra = a.split(".").slice(-2).join(".");
  const rb = b.split(".").slice(-2).join(".");
  return ra === rb && ra.includes(".");
}

/**
 * Cross-origin app → API needs SameSite=None; Secure.
 * Same-site (e.g. *.revibase.com, or localhost ports) can use Lax.
 */
function sessionCookieSecurity(request: Request): {
  sameSite: "lax" | "none";
  secure: boolean;
} {
  const apiUrl = new URL(request.url);
  const originHeader = request.headers.get("origin")?.trim();
  if (!originHeader) {
    return {
      sameSite: "lax",
      secure: apiUrl.protocol === "https:",
    };
  }
  try {
    const originHost = new URL(originHeader).hostname;
    if (isSameSiteHost(originHost, apiUrl.hostname)) {
      return {
        sameSite: "lax",
        secure: apiUrl.protocol === "https:",
      };
    }
  } catch {
    // fall through to cross-site defaults
  }
  return { sameSite: "none", secure: true };
}

export async function readWalletSessionFromCookies(): Promise<WalletSessionClaims | null> {
  const token = getCookie(WALLET_SESSION_COOKIE);
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
  const { sameSite, secure } = sessionCookieSecurity(getRequest());
  return {
    name: WALLET_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: WALLET_SESSION_TTL_SEC,
  };
}

export function clearWalletSessionCookieOptions() {
  const { sameSite, secure } = sessionCookieSecurity(getRequest());
  return {
    name: WALLET_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 0,
  };
}

export function walletSessionErrorMessage(error: unknown): string {
  if (error instanceof WalletSessionError) return error.message;
  return "Sign in again";
}

export function serializeCookie(options: {
  name: string;
  value: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
  path?: string;
  maxAge?: number;
}): string {
  const parts = [`${options.name}=${options.value}`];
  if (options.maxAge != null) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}
