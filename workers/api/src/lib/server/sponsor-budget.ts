import { getAppDb } from "./app-db";

/** Max sponsored transactions per vault per UTC day. */
export const SPONSOR_DAILY_TX_LIMIT = 50;

export class SponsorBudgetError extends Error {
  constructor(message = "Daily sponsorship limit reached") {
    super(message);
    this.name = "SponsorBudgetError";
  }
}

function dayKey(nowMs = Date.now()): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}

/** Increment and enforce the per-vault daily sponsor budget. */
export async function assertSponsorBudget(vaultPda: string): Promise<void> {
  const day = dayKey();
  const now = Date.now();
  const row = await getAppDb()
    .prepare(
      `INSERT INTO sponsor_budget (vault_pda, day_key, tx_count, updated_at_ms)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(vault_pda, day_key) DO UPDATE SET
         tx_count = tx_count + 1,
         updated_at_ms = excluded.updated_at_ms
       RETURNING tx_count`,
    )
    .bind(vaultPda, day, now)
    .first<{ tx_count: number }>();
  if ((row?.tx_count ?? 0) > SPONSOR_DAILY_TX_LIMIT) {
    throw new SponsorBudgetError();
  }
}

/** Remove sponsor budget rows older than the retention window. */
export async function sweepSponsorBudget(
  retentionDays = 14,
  nowMs = Date.now(),
): Promise<number> {
  const cutoff = new Date(nowMs - retentionDays * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const result = await getAppDb()
    .prepare(`DELETE FROM sponsor_budget WHERE day_key < ?`)
    .bind(cutoff)
    .run();
  return result.meta.changes ?? 0;
}
