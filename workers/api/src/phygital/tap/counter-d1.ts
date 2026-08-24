import { getAppDb } from "@/platform/app-db";

/**
 * D1 monotonic tap counter (strict advance).
 * KV reentry grace lives in `./counter-store` (`revibase_counter`).
 * Atomically advances the stored counter when `nextCounter` is strictly greater.
 */
export async function tryAdvanceD1Counter(
  publicKey: string,
  nextCounter: number,
  nowMs = Date.now(),
): Promise<boolean> {
  const insert = await getAppDb()
    .prepare(
      `INSERT INTO nfc_tap_counters (public_key, counter, updated_at_ms)
       VALUES (?, ?, ?)
       ON CONFLICT(public_key) DO UPDATE SET
         counter = excluded.counter,
         updated_at_ms = excluded.updated_at_ms
       WHERE excluded.counter > nfc_tap_counters.counter`,
    )
    .bind(publicKey, nextCounter, nowMs)
    .run();
  return (insert.meta.changes ?? 0) > 0;
}
