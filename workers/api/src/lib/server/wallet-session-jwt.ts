import { address, type Address } from "@solana/kit";

import { getEnv } from "@/lib/server/request-context";
import { base64UrlToBytes, bytesToBase64Url } from "@/shared/base64";
import { timingSafeEqualString } from "./timing-safe";
import {
  isWalletSessionJtiRevoked,
  revokeWalletSessionJti,
} from "./wallet-session-revocation";

export const WALLET_SESSION_COOKIE = "phygital_wallet_session";
/** HttpOnly wallet API cookie lifetime (24h). */
export const WALLET_SESSION_TTL_SEC = 24 * 60 * 60;

export type WalletSessionClaims = {
  vaultPda: Address;
  walletPda: Address;
  authorityPda: Address;
  jti: string;
};

export class WalletSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletSessionError";
  }
}

function sessionSecret(): string {
  const secret = getEnv().WALLET_SESSION_SECRET?.trim();
  if (secret) return secret;
  throw new WalletSessionError("Wallet sessions are not configured");
}

function encodePart(value: unknown): string {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

let cachedHmacKey: { secret: string; key: CryptoKey } | null = null;

async function hmacKey(secret: string): Promise<CryptoKey> {
  if (cachedHmacKey?.secret === secret) return cachedHmacKey.key;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  cachedHmacKey = { secret, key };
  return key;
}

async function hmacSha256Base64Url(secret: string, data: string): Promise<string> {
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return bytesToBase64Url(new Uint8Array(sig));
}

export async function signWalletSessionJwt(
  claims: WalletSessionClaims,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jti = claims.jti || bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const header = encodePart({ alg: "HS256", typ: "JWT" });
  const payload = encodePart({
    vault: String(claims.vaultPda),
    wallet: String(claims.walletPda),
    authority: String(claims.authorityPda),
    jti,
    iat: now,
    exp: now + WALLET_SESSION_TTL_SEC,
  });
  const unsigned = `${header}.${payload}`;
  const sig = await hmacSha256Base64Url(sessionSecret(), unsigned);
  return `${unsigned}.${sig}`;
}

export async function verifyWalletSessionJwt(
  token: string,
): Promise<WalletSessionClaims> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new WalletSessionError("Sign in again");
  }
  const [header, payload, sig] = parts as [string, string, string];
  let headerBody: { alg?: string };
  try {
    headerBody = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(header)),
    ) as { alg?: string };
  } catch {
    throw new WalletSessionError("Sign in again");
  }
  if (headerBody.alg !== "HS256") {
    throw new WalletSessionError("Sign in again");
  }
  const unsigned = `${header}.${payload}`;
  const expected = await hmacSha256Base64Url(sessionSecret(), unsigned);
  if (!timingSafeEqualString(sig, expected)) {
    throw new WalletSessionError("Sign in again");
  }

  let body: {
    vault?: string;
    wallet?: string;
    authority?: string;
    jti?: string;
    exp?: number;
  };
  try {
    body = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload)),
    ) as typeof body;
  } catch {
    throw new WalletSessionError("Sign in again");
  }
  if (
    !body.vault ||
    !body.wallet ||
    !body.authority ||
    !body.jti ||
    typeof body.exp !== "number"
  ) {
    throw new WalletSessionError("Sign in again");
  }
  if (body.exp <= Math.floor(Date.now() / 1000)) {
    throw new WalletSessionError("Your session expired. Sign in again.");
  }
  if (await isWalletSessionJtiRevoked(body.jti)) {
    throw new WalletSessionError("Sign in again");
  }

  return {
    vaultPda: address(body.vault),
    walletPda: address(body.wallet),
    authorityPda: address(body.authority),
    jti: body.jti,
  };
}

export async function revokeWalletSessionToken(token: string): Promise<void> {
  try {
    const claims = await verifyWalletSessionJwt(token);
    await revokeWalletSessionJti(claims.jti, String(claims.vaultPda));
  } catch {
    /* best-effort logout */
  }
}
