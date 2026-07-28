import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

// Minimal D1 surface we use (avoids pulling @cloudflare/workers-types into the
// Next build, which conflicts with the DOM lib).
type D1Result<T> = { results: T[] };
type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
};
type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
  exec(query: string): Promise<unknown>;
};

/** A single indexed token transfer (payment). */
export type PaymentRecord = {
  signature: string;
  transferIndex: number;
  slot: number | null;
  blockTime: number | null;
  mint: string;
  amount: string; // raw u64 decimal string
  senderOwner: string | null;
  recipientOwner: string | null;
  senderTokenAccount: string | null;
  recipientTokenAccount: string | null;
};

/** DB row shape (snake_case columns). */
type PaymentRow = {
  signature: string;
  transfer_index: number;
  slot: number | null;
  block_time: number | null;
  mint: string;
  amount: string;
  sender_owner: string | null;
  recipient_owner: string | null;
  sender_token_account: string | null;
  recipient_token_account: string | null;
};

export function getPaymentsDb(): D1Database {
  const db = (getCloudflareContext().env as unknown as { DB?: D1Database }).DB;
  if (!db) {
    throw new Error("D1 binding DB is not configured");
  }
  return db;
}

// Schema is applied via `wrangler d1 migrations apply` in production; this
// lazy guard makes local dev (Miniflare auto-creates the D1) work with no
// manual step. Cached per isolate so it runs at most once per worker instance.
let schemaReady: Promise<void> | null = null;

export function ensurePaymentsSchema(db: D1Database): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.batch([
        db.prepare(
          `CREATE TABLE IF NOT EXISTS payments (
             signature TEXT NOT NULL,
             transfer_index INTEGER NOT NULL,
             slot INTEGER,
             block_time INTEGER,
             mint TEXT NOT NULL,
             amount TEXT NOT NULL,
             sender_owner TEXT,
             recipient_owner TEXT,
             sender_token_account TEXT,
             recipient_token_account TEXT,
             indexed_at INTEGER NOT NULL DEFAULT (unixepoch()),
             PRIMARY KEY (signature, transfer_index)
           )`,
        ),
        db.prepare(
          `CREATE INDEX IF NOT EXISTS idx_payments_recipient
             ON payments (recipient_owner, block_time DESC)`,
        ),
        db.prepare(
          `CREATE INDEX IF NOT EXISTS idx_payments_sender
             ON payments (sender_owner, block_time DESC)`,
        ),
      ]);
    })().catch((error) => {
      // Allow a later request to retry schema creation.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

/** Idempotent bulk insert (ignores rows already indexed). */
export async function insertPayments(
  db: D1Database,
  rows: PaymentRecord[],
): Promise<void> {
  if (rows.length === 0) return;
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO payments
       (signature, transfer_index, slot, block_time, mint, amount,
        sender_owner, recipient_owner, sender_token_account, recipient_token_account)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  await db.batch(
    rows.map((r) =>
      stmt.bind(
        r.signature,
        r.transferIndex,
        r.slot,
        r.blockTime,
        r.mint,
        r.amount,
        r.senderOwner,
        r.recipientOwner,
        r.senderTokenAccount,
        r.recipientTokenAccount,
      ),
    ),
  );
}

/** Payments where `owner` is the recipient or sender, newest first. */
export async function getPaymentsForOwner(
  db: D1Database,
  owner: string,
  opts?: { limit?: number; beforeBlockTime?: number },
): Promise<PaymentRecord[]> {
  const limit = Math.min(Math.max(opts?.limit ?? 50, 1), 200);
  const params: unknown[] = [owner];
  let where = "(recipient_owner = ?1 OR sender_owner = ?1)";
  if (opts?.beforeBlockTime != null) {
    params.push(opts.beforeBlockTime);
    where += ` AND block_time < ?${params.length}`;
  }
  params.push(limit);
  const sql = `SELECT * FROM payments WHERE ${where}
     ORDER BY block_time DESC, rowid DESC LIMIT ?${params.length}`;

  const { results } = await db
    .prepare(sql)
    .bind(...params)
    .all<PaymentRow>();
  return results.map(rowToRecord);
}

function rowToRecord(row: PaymentRow): PaymentRecord {
  return {
    signature: row.signature,
    transferIndex: row.transfer_index,
    slot: row.slot,
    blockTime: row.block_time,
    mint: row.mint,
    amount: row.amount,
    senderOwner: row.sender_owner,
    recipientOwner: row.recipient_owner,
    senderTokenAccount: row.sender_token_account,
    recipientTokenAccount: row.recipient_token_account,
  };
}
