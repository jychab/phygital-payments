import type { Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";

import { base64UrlToBytes, bytesToBase64Url } from "@/shared/crypto/base64";
import { getEnv } from "@/shared/request-context";

const SESSION_COOKIE = "revibase_phygital_session";
const SESSION_TTL_MS = 10 * 60 * 1000;

export type TokenSession = {
  phygitalToken: string;
  secp256r1PublicKey: string;
  exp: number;
  jti: string;
};

function requireSessionSecret(): string {
  const secret = getEnv().POLICY_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("POLICY_SESSION_SECRET is not configured");
  }
  return secret;
}

async function hmacSha256(secret: string, payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return new Uint8Array(sig);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

export async function mintSessionToken(args: {
  phygitalToken: string;
  secp256r1PublicKey: string;
  now?: number;
}): Promise<{ token: string; expiresAt: number }> {
  const now = args.now ?? Date.now();
  const exp = now + SESSION_TTL_MS;
  const jti = crypto.randomUUID();
  const payload = `${args.phygitalToken}|${args.secp256r1PublicKey}|${exp}|${jti}`;
  const mac = await hmacSha256(requireSessionSecret(), payload);
  const token = `${bytesToBase64Url(new TextEncoder().encode(payload))}.${bytesToBase64Url(mac)}`;
  return { token, expiresAt: exp };
}

async function parseSessionToken(
  token: string,
  now = Date.now(),
): Promise<TokenSession | null> {
  const [payloadB64, macB64] = token.split(".");
  if (!payloadB64 || !macB64) return null;
  try {
    const payloadBytes = base64UrlToBytes(payloadB64);
    const payload = new TextDecoder().decode(payloadBytes);
    const expectedMac = await hmacSha256(requireSessionSecret(), payload);
    const actualMac = base64UrlToBytes(macB64);
    if (!timingSafeEqual(expectedMac, actualMac)) return null;
    const [phygitalToken, secp256r1PublicKey, expStr, jti] = payload.split("|");
    const exp = Number(expStr);
    if (!phygitalToken || !secp256r1PublicKey || !jti || !Number.isFinite(exp)) {
      return null;
    }
    if (exp <= now) return null;
    return { phygitalToken, secp256r1PublicKey, exp, jti };
  } catch {
    return null;
  }
}

export function setSessionCookie(
  c: Context,
  token: string,
  expiresAt: number,
): void {
  const maxAge = Math.max(1, Math.floor((expiresAt - Date.now()) / 1000));
  const { secure, sameSite } = cookieAttrsForRequest(c);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge,
  });
}

function clearSessionCookie(c: Context): void {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
}

/** Local HTTP cannot set SameSite=None;Secure — use Lax so cookies stick in wrangler dev. */
function cookieAttrsForRequest(c: Context): {
  secure: boolean;
  sameSite: "None" | "Lax";
} {
  try {
    const url = new URL(c.req.url);
    const localHttp =
      url.protocol === "http:" &&
      (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (localHttp) return { secure: false, sameSite: "Lax" };
  } catch {
    /* fall through */
  }
  return { secure: true, sameSite: "None" };
}

/** Read the owner session cookie if present and still valid. */
export async function readSessionCookie(
  c: Context,
  now = Date.now(),
): Promise<TokenSession | null> {
  const raw = getCookie(c, SESSION_COOKIE);
  if (!raw) return null;
  return parseSessionToken(raw, now);
}

/** Require cookie session matching `:phygitalToken` path param. */
export async function requireTokenSession(
  c: Context,
): Promise<TokenSession | Response> {
  const expected = c.req.param("phygitalToken")?.trim();
  if (!expected) {
    return c.json(
      { error: "Missing phygitalToken", code: "invalid_transaction" },
      400,
    );
  }

  const raw = getCookie(c, SESSION_COOKIE);
  if (!raw) {
    return c.json(
      {
        error: "Hold your item to continue.",
        code: "session_required",
      },
      401,
    );
  }

  const session = await parseSessionToken(raw);
  if (!session) {
    clearSessionCookie(c);
    return c.json(
      {
        error: "Session expired. Hold your item to continue.",
        code: "session_expired",
      },
      401,
    );
  }

  if (session.phygitalToken !== expected) {
    return c.json(
      {
        error: "Session does not match this item.",
        code: "session_token_mismatch",
      },
      403,
    );
  }

  return session;
}
