import { getAppDb } from "@/platform/app-db";

export async function revokeWalletSessionJti(
  jti: string,
  vaultPda: string,
): Promise<void> {
  await getAppDb()
    .prepare(
      `INSERT OR IGNORE INTO wallet_session_revocations (jti, vault_pda, revoked_at_ms)
       VALUES (?, ?, ?)`,
    )
    .bind(jti, vaultPda, Date.now())
    .run();
}

export async function isWalletSessionJtiRevoked(jti: string): Promise<boolean> {
  const row = await getAppDb()
    .prepare(`SELECT 1 AS ok FROM wallet_session_revocations WHERE jti = ? LIMIT 1`)
    .bind(jti)
    .first<{ ok: number }>();
  return row != null;
}

/** Drop revocation rows older than the cutoff (JWTs are short-lived). */
export async function sweepWalletSessionRevocations(cutoffMs: number): Promise<void> {
  await getAppDb()
    .prepare(`DELETE FROM wallet_session_revocations WHERE revoked_at_ms < ?`)
    .bind(cutoffMs)
    .run();
}
