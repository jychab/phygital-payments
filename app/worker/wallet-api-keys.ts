// D1 surface for wallet API keys — grant lifecycle lives in PreauthGrantsDO.
import {
  formatPayApiKey,
  parseWalletFromPayApiKey,
} from "../src/lib/payments/pay-api-key";

export type { PreauthGrant } from "./preauth-grant-types";
export {
  PREAUTH_MIN_INTERVAL_SECONDS,
  PREAUTH_TTL_SECONDS,
} from "./preauth-grant-types";

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<{ meta?: { changes?: number } }>;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results: T[] }>;
};
export type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
};

let schemaReady: Promise<void> | null = null;

function schemaManagedExternally(): boolean {
  return process.env.NEXTJS_ENV === "production";
}

/** Ensure wallet_api_keys exists (local Miniflare + migrations lag). Skipped in production. */
export function ensureWalletApiKeysSchema(db: D1Database): Promise<void> {
  if (schemaManagedExternally()) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.batch([
        db.prepare(
          `CREATE TABLE IF NOT EXISTS wallet_api_keys (
             wallet TEXT NOT NULL PRIMARY KEY,
             api_key_hash TEXT NOT NULL UNIQUE,
             created_at INTEGER NOT NULL DEFAULT (unixepoch()),
             revoked_at INTEGER
           )`,
        ),
      ]);
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

/** SHA-256 hex digest of an API key (Web Crypto). */
export async function hashApiKey(apiKey: string): Promise<string> {
  const data = new TextEncoder().encode(apiKey);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(bytes = 24): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function issueWalletApiKey(
  db: D1Database,
  wallet: string,
): Promise<{ apiKey: string }> {
  await ensureWalletApiKeysSchema(db);
  const secret = randomToken();
  const apiKey = formatPayApiKey(wallet, secret);
  const apiKeyHash = await hashApiKey(apiKey);
  await db
    .prepare(
      `INSERT INTO wallet_api_keys (wallet, api_key_hash, created_at, revoked_at)
       VALUES (?, ?, unixepoch(), NULL)
       ON CONFLICT(wallet) DO UPDATE SET
         api_key_hash = excluded.api_key_hash,
         created_at = unixepoch(),
         revoked_at = NULL`,
    )
    .bind(wallet, apiKeyHash)
    .run();
  return { apiKey };
}

/** Verify `ppk_<wallet>_<secret>` against the stored hash for that wallet. */
export async function verifyPayApiKey(
  db: D1Database,
  apiKey: string,
): Promise<string | null> {
  await ensureWalletApiKeysSchema(db);
  const trimmed = apiKey.trim();
  if (!trimmed) return null;

  const wallet = parseWalletFromPayApiKey(trimmed);
  if (!wallet) return null;

  const apiKeyHash = await hashApiKey(trimmed);
  const row = await db
    .prepare(
      `SELECT wallet FROM wallet_api_keys
       WHERE wallet = ? AND api_key_hash = ? AND revoked_at IS NULL`,
    )
    .bind(wallet, apiKeyHash)
    .first<{ wallet: string }>();
  return row?.wallet ?? null;
}

/** True when this wallet has a non-revoked device pay key (no key material). */
export async function walletHasActiveApiKey(
  db: D1Database,
  wallet: string,
): Promise<boolean> {
  await ensureWalletApiKeysSchema(db);
  const row = await db
    .prepare(
      `SELECT wallet FROM wallet_api_keys
       WHERE wallet = ? AND revoked_at IS NULL`,
    )
    .bind(wallet)
    .first<{ wallet: string }>();
  return row != null;
}
