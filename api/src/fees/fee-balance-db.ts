import { getD1 } from "@/shared/db";

function db() {
  return getD1();
}

export async function getFeeBalanceLamports(
  phygitalToken: string,
): Promise<number> {
  const row = await db()
    .prepare(
      `SELECT balance_lamports FROM token_fee_balances WHERE phygital_token = ?`,
    )
    .bind(phygitalToken)
    .first<{ balance_lamports: number }>();
  return row?.balance_lamports ?? 0;
}

/**
 * Credit fee balance. Idempotent on `signature`.
 * @returns true if this signature newly applied a credit
 */
export async function creditFeeBalance(args: {
  phygitalToken: string;
  lamports: number;
  signature: string;
}): Promise<boolean> {
  if (args.lamports <= 0) return false;
  const now = Date.now();
  const d1 = db();

  const existing = await d1
    .prepare(`SELECT signature FROM fee_balance_events WHERE signature = ?`)
    .bind(args.signature)
    .first();
  if (existing) return false;

  await d1.batch([
    d1
      .prepare(
        `INSERT INTO fee_balance_events (signature, kind, phygital_token, lamports, created_at)
         VALUES (?, 'credit', ?, ?, ?)`,
      )
      .bind(args.signature, args.phygitalToken, args.lamports, now),
    d1
      .prepare(
        `INSERT INTO token_fee_balances (phygital_token, balance_lamports, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(phygital_token) DO UPDATE SET
           balance_lamports = balance_lamports + excluded.balance_lamports,
           updated_at = excluded.updated_at`,
      )
      .bind(args.phygitalToken, args.lamports, now),
  ]);
  return true;
}

/**
 * Debit fee balance (clamp at 0). Idempotent on `signature`.
 * @returns true if this signature newly applied a debit
 */
export async function debitFeeBalance(args: {
  phygitalToken: string;
  lamports: number;
  signature: string;
}): Promise<boolean> {
  if (args.lamports <= 0) return false;
  const now = Date.now();
  const d1 = db();

  const existing = await d1
    .prepare(`SELECT signature FROM fee_balance_events WHERE signature = ?`)
    .bind(args.signature)
    .first();
  if (existing) return false;

  await d1.batch([
    d1
      .prepare(
        `INSERT INTO fee_balance_events (signature, kind, phygital_token, lamports, created_at)
         VALUES (?, 'debit', ?, ?, ?)`,
      )
      .bind(args.signature, args.phygitalToken, args.lamports, now),
    d1
      .prepare(
        `INSERT INTO token_fee_balances (phygital_token, balance_lamports, updated_at)
         VALUES (?, 0, ?)
         ON CONFLICT(phygital_token) DO UPDATE SET
           balance_lamports = MAX(0, balance_lamports - ?),
           updated_at = ?`,
      )
      .bind(args.phygitalToken, now, args.lamports, now),
  ]);
  return true;
}
