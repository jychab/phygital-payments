// Minimal D1 surface shared by the Next API routes and the fee-payer DO.
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

export const PREAUTH_TTL_SECONDS = 45;
/** Minimum gap between preauth opens for the same wallet (rate limit). */
export const PREAUTH_MIN_INTERVAL_SECONDS = 2;

export type PreauthGrant = {
  id: string;
  wallet: string;
  maxAmount: string;
  mint: string | null;
  expiresAt: number;
  consumedAt: number | null;
};

type GrantRow = {
  id: string;
  wallet: string;
  max_amount: string;
  mint: string | null;
  expires_at: number;
  consumed_at: number | null;
};

let preauthSchemaReady: Promise<void> | null = null;

/** Ensure preauth tables exist (local Miniflare + migrations lag). */
export function ensurePreauthSchema(db: D1Database): Promise<void> {
  if (!preauthSchemaReady) {
    preauthSchemaReady = (async () => {
      await db.batch([
        db.prepare(
          `CREATE TABLE IF NOT EXISTS wallet_api_keys (
             wallet TEXT NOT NULL PRIMARY KEY,
             api_key_hash TEXT NOT NULL UNIQUE,
             created_at INTEGER NOT NULL DEFAULT (unixepoch()),
             revoked_at INTEGER
           )`,
        ),
        db.prepare(
          `CREATE TABLE IF NOT EXISTS preauth_grants (
             id TEXT NOT NULL PRIMARY KEY,
             wallet TEXT NOT NULL,
             max_amount TEXT NOT NULL,
             mint TEXT,
             expires_at INTEGER NOT NULL,
             consumed_at INTEGER,
             claimed_at INTEGER,
             claimed_by TEXT,
             created_at INTEGER NOT NULL DEFAULT (unixepoch())
           )`,
        ),
        db.prepare(
          `CREATE INDEX IF NOT EXISTS idx_preauth_wallet_active
             ON preauth_grants (wallet, expires_at DESC)`,
        ),
      ]);
      // Local Miniflare may lag behind wrangler migrations (presence-only → mint/max_amount).
      await migrateEnsureGrantMintAmount(db);
    })().catch((error) => {
      preauthSchemaReady = null;
      throw error;
    });
  }
  return preauthSchemaReady;
}

/** Add mint / max_amount if a presence-only table already exists (same as 0004). */
async function migrateEnsureGrantMintAmount(db: D1Database): Promise<void> {
  const cols = await db
    .prepare(`PRAGMA table_info(preauth_grants)`)
    .all<{ name: string }>();
  const names = new Set((cols.results ?? []).map((c) => c.name));
  const statements: D1PreparedStatement[] = [];
  if (!names.has("max_amount")) {
    statements.push(
      db.prepare(
        `ALTER TABLE preauth_grants ADD COLUMN max_amount TEXT NOT NULL DEFAULT '0'`,
      ),
    );
  }
  if (!names.has("mint")) {
    statements.push(
      db.prepare(`ALTER TABLE preauth_grants ADD COLUMN mint TEXT`),
    );
  }
  if (statements.length > 0) await db.batch(statements);
}

/** SHA-256 hex digest of an API key (Web Crypto). */
export async function hashApiKey(apiKey: string): Promise<string> {
  const data = new TextEncoder().encode(apiKey);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken(bytes = 32): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function issueWalletApiKey(
  db: D1Database,
  wallet: string,
): Promise<{ apiKey: string }> {
  await ensurePreauthSchema(db);
  const apiKey = `ppk_${randomToken(24)}`;
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

export async function revokeWalletApiKey(
  db: D1Database,
  wallet: string,
): Promise<boolean> {
  await ensurePreauthSchema(db);
  const result = await db
    .prepare(
      `UPDATE wallet_api_keys SET revoked_at = unixepoch()
       WHERE wallet = ? AND revoked_at IS NULL`,
    )
    .bind(wallet)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

export async function resolveWalletFromApiKey(
  db: D1Database,
  apiKey: string,
): Promise<string | null> {
  await ensurePreauthSchema(db);
  const apiKeyHash = await hashApiKey(apiKey);
  const row = await db
    .prepare(
      `SELECT wallet FROM wallet_api_keys
       WHERE api_key_hash = ? AND revoked_at IS NULL`,
    )
    .bind(apiKeyHash)
    .first<{ wallet: string }>();
  return row?.wallet ?? null;
}

/** True when this wallet has a non-revoked device pay key (no key material). */
export async function walletHasActiveApiKey(
  db: D1Database,
  wallet: string,
): Promise<boolean> {
  await ensurePreauthSchema(db);
  const row = await db
    .prepare(
      `SELECT wallet FROM wallet_api_keys
       WHERE wallet = ? AND revoked_at IS NULL`,
    )
    .bind(wallet)
    .first<{ wallet: string }>();
  return row != null;
}

/**
 * Open (or replace) a spending window for `wallet`.
 * Grant binds mint + maxAmount; on-chain delegate is a second cap.
 * Grant does not bind recipient — payer opens before the merchant NFC tap.
 */
export async function createPreauthGrant(
  db: D1Database,
  args: { wallet: string; maxAmount: string; mint?: string | null },
): Promise<PreauthGrant> {
  await ensurePreauthSchema(db);
  const now = Math.floor(Date.now() / 1000);

  const recent = await db
    .prepare(
      `SELECT created_at FROM preauth_grants
       WHERE wallet = ?
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(args.wallet)
    .first<{ created_at: number }>();
  if (
    recent &&
    now - recent.created_at < PREAUTH_MIN_INTERVAL_SECONDS
  ) {
    throw new Error("Preauth rate limited — try again in a moment");
  }

  await invalidateActiveGrantsForWallet(db, args.wallet, now);

  const id = crypto.randomUUID();
  const expiresAt = now + PREAUTH_TTL_SECONDS;
  const mint = args.mint ?? null;

  await db
    .prepare(
      `INSERT INTO preauth_grants
         (id, wallet, max_amount, mint, expires_at, consumed_at, claimed_at, claimed_by, created_at)
       VALUES (?, ?, ?, ?, ?, NULL, NULL, NULL, ?)`,
    )
    .bind(id, args.wallet, args.maxAmount, mint, expiresAt, now)
    .run();

  return {
    id,
    wallet: args.wallet,
    maxAmount: args.maxAmount,
    mint,
    expiresAt,
    consumedAt: null,
  };
}

/**
 * Latest claimable grant for wallet: unconsumed, unclaimed, unexpired.
 * Claimed grants are single-use in-flight and not selectable by peers.
 */
export async function findActiveGrantForWallet(
  db: D1Database,
  wallet: string,
): Promise<PreauthGrant | null> {
  await ensurePreauthSchema(db);
  const now = Math.floor(Date.now() / 1000);
  const row = await db
    .prepare(
      `SELECT id, wallet, max_amount, mint, expires_at, consumed_at
       FROM preauth_grants
       WHERE wallet = ?
         AND consumed_at IS NULL
         AND claimed_at IS NULL
         AND expires_at > ?
       ORDER BY created_at DESC LIMIT 1`,
    )
    .bind(wallet, now)
    .first<GrantRow>();
  return row ? rowToGrant(row) : null;
}

/**
 * Atomically claim a grant for `jobId` (single-use).
 * Mint must match when the grant bound one; amount must be ≤ maxAmount.
 * On-chain delegate is a second cap. Second job in the same batch loses the race.
 */
export async function claimGrantForTransfer(
  db: D1Database,
  args: { wallet: string; amount: string; mint: string; jobId: string },
): Promise<{ grantId: string }> {
  await ensurePreauthSchema(db);
  const now = Math.floor(Date.now() / 1000);

  const grant = await findActiveGrantForWallet(db, args.wallet);
  if (!grant) {
    throw new Error("No active preauth grant for this wallet");
  }
  if (grant.mint && grant.mint !== args.mint) {
    throw new Error("Preauth grant mint mismatch");
  }
  if (BigInt(args.amount) > BigInt(grant.maxAmount)) {
    throw new Error("Transfer amount exceeds preauth maxAmount");
  }

  const result = await db
    .prepare(
      `UPDATE preauth_grants
       SET claimed_at = ?, claimed_by = ?
       WHERE id = ?
         AND consumed_at IS NULL
         AND claimed_at IS NULL
         AND expires_at > ?`,
    )
    .bind(now, args.jobId, grant.id, now)
    .run();

  if ((result.meta?.changes ?? 0) === 0) {
    throw new Error("Preauth grant already used");
  }

  return { grantId: grant.id };
}

/** Mark all unconsumed grants for `wallet` as consumed (Cancel / reopen). */
export async function invalidateActiveGrantsForWallet(
  db: D1Database,
  wallet: string,
  now = Math.floor(Date.now() / 1000),
): Promise<void> {
  await ensurePreauthSchema(db);
  await db
    .prepare(
      `UPDATE preauth_grants SET consumed_at = ?
       WHERE wallet = ? AND consumed_at IS NULL AND expires_at > ?`,
    )
    .bind(now, wallet, now)
    .run();
}

/** Release an in-flight claim so a retry can re-claim (or another payment can fail closed). */
export async function releaseGrantClaim(
  db: D1Database,
  grantId: string,
): Promise<boolean> {
  await ensurePreauthSchema(db);
  const result = await db
    .prepare(
      `UPDATE preauth_grants
       SET claimed_at = NULL, claimed_by = NULL
       WHERE id = ? AND consumed_at IS NULL AND claimed_at IS NOT NULL`,
    )
    .bind(grantId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

/** Finalize single-use after a successful submit. */
export async function consumeGrant(
  db: D1Database,
  grantId: string,
): Promise<boolean> {
  await ensurePreauthSchema(db);
  const now = Math.floor(Date.now() / 1000);
  const result = await db
    .prepare(
      `UPDATE preauth_grants SET consumed_at = ?
       WHERE id = ? AND consumed_at IS NULL`,
    )
    .bind(now, grantId)
    .run();
  return (result.meta?.changes ?? 0) > 0;
}

/** Batch-consume grants after a successful multi-job submit. */
export async function consumeGrants(
  db: D1Database,
  grantIds: string[],
): Promise<void> {
  if (grantIds.length === 0) return;
  await ensurePreauthSchema(db);
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare(
    `UPDATE preauth_grants SET consumed_at = ?
     WHERE id = ? AND consumed_at IS NULL`,
  );
  await db.batch(grantIds.map((id) => stmt.bind(now, id)));
}

/** Batch-release in-flight claims after a failed submit. */
export async function releaseGrantClaims(
  db: D1Database,
  grantIds: string[],
): Promise<void> {
  if (grantIds.length === 0) return;
  await ensurePreauthSchema(db);
  const stmt = db.prepare(
    `UPDATE preauth_grants
     SET claimed_at = NULL, claimed_by = NULL
     WHERE id = ? AND consumed_at IS NULL AND claimed_at IS NOT NULL`,
  );
  await db.batch(grantIds.map((id) => stmt.bind(id)));
}

function rowToGrant(row: GrantRow): PreauthGrant {
  return {
    id: row.id,
    wallet: row.wallet,
    maxAmount: row.max_amount,
    mint: row.mint,
    expiresAt: row.expires_at,
    consumedAt: row.consumed_at,
  };
}
