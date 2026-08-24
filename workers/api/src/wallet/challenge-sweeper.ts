import { getAppDb } from "@/platform/app-db";

/** Delete expired challenges (consumed or not). */
export async function sweepExpiredChallenges(
  nowMs = Date.now(),
): Promise<number> {
  const result = await getAppDb()
    .prepare(`DELETE FROM challenges WHERE expires_at_ms < ?`)
    .bind(nowMs)
    .run();
  return result.meta.changes ?? 0;
}
