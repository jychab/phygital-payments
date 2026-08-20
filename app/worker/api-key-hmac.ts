/**
 * HMAC-tagged API keys: `ppk_<wallet>_<gen>_<hmac>`.
 * Parsing is pure crypto — no database lookup.
 */

export const INVALID_API_KEY = "Invalid or revoked API key";
export const REVOKED_API_KEY =
  "Key has been revoked — re-provision to get a new key";
export const API_KEY_HEADER = "x-api-key";
export const MISSING_API_KEY_HEADER = "Missing x-api-key header";

/** Extract the API key from `x-api-key`. Empty if missing. */
export function apiKeyFromHeader(headers: Headers): string {
  return headers.get(API_KEY_HEADER)?.trim() ?? "";
}

const PREFIX = "ppk_";
const HMAC_HEX_LEN = 48;

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function computeTag(
  key: CryptoKey,
  wallet: string,
  gen: number,
): Promise<string> {
  const data = new TextEncoder().encode(`${wallet}:${gen}`);
  const sig = await crypto.subtle.sign("HMAC", key, data);
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, HMAC_HEX_LEN);
}

export type ParsedApiKey = { wallet: string; gen: number };

export async function signApiKey(
  secret: string,
  wallet: string,
  gen: number,
): Promise<string> {
  const key = await importKey(secret);
  const tag = await computeTag(key, wallet, gen);
  return `${PREFIX}${wallet}_${gen}_${tag}`;
}

/** Parse an HMAC-tagged API key. Returns `{ wallet, gen }` or `null`. */
export async function parseApiKey(
  secret: string,
  apiKey: string,
): Promise<ParsedApiKey | null> {
  const trimmed = apiKey.trim();
  if (!trimmed.startsWith(PREFIX)) return null;

  const body = trimmed.slice(PREFIX.length);
  const parts = body.split("_");
  if (parts.length !== 3) return null;

  const [wallet, genStr, tag] = parts as [string, string, string];
  if (!wallet || !genStr || !tag) return null;

  const gen = Number(genStr);
  if (!Number.isFinite(gen) || gen < 0 || !Number.isInteger(gen)) return null;
  if (wallet.length < 32 || wallet.length > 44) return null;
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(wallet)) return null;
  if (tag.length !== HMAC_HEX_LEN || !/^[a-f0-9]+$/.test(tag)) return null;

  const key = await importKey(secret);
  const expected = await computeTag(key, wallet, gen);

  // Timing-safe comparison via double-HMAC: HMAC(expected) === HMAC(tag).
  const a = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(expected),
  );
  const b = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(tag),
  );

  const av = new Uint8Array(a);
  const bv = new Uint8Array(b);
  if (av.length !== bv.length) return null;
  let diff = 0;
  for (let i = 0; i < av.length; i++) {
    diff |= av[i]! ^ bv[i]!;
  }
  if (diff !== 0) return null;

  return { wallet, gen };
}
