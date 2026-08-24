import { getAppDb } from "./app-db";

export type ConsumableChallenge = {
  requestId: string;
  expiresAtMs: number;
  consumed: boolean;
};

/**
 * Short-lived challenges in D1. Expiry is enforced on read (no KV TTL).
 * `kind` isolates wallet auth vs agent NFC namespaces.
 */
export function createD1ChallengeStore<T extends ConsumableChallenge>(
  kind: string,
) {
  return {
    async put(challenge: T): Promise<void> {
      await getAppDb()
        .prepare(
          `INSERT INTO challenges (kind, request_id, payload_json, expires_at_ms, consumed)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(kind, request_id) DO UPDATE SET
             payload_json = excluded.payload_json,
             expires_at_ms = excluded.expires_at_ms,
             consumed = excluded.consumed`,
        )
        .bind(
          kind,
          challenge.requestId,
          JSON.stringify(challenge),
          challenge.expiresAtMs,
          challenge.consumed ? 1 : 0,
        )
        .run();
    },

    async take(requestId: string): Promise<T | null> {
      const now = Date.now();
      const row = await getAppDb()
        .prepare(
          `SELECT payload_json, expires_at_ms, consumed
           FROM challenges WHERE kind = ? AND request_id = ?`,
        )
        .bind(kind, requestId)
        .first<{
          payload_json: string;
          expires_at_ms: number;
          consumed: number;
        }>();
      if (!row || row.consumed !== 0 || now >= row.expires_at_ms) {
        if (row && now >= row.expires_at_ms) {
          await getAppDb()
            .prepare(`DELETE FROM challenges WHERE kind = ? AND request_id = ?`)
            .bind(kind, requestId)
            .run();
        }
        return null;
      }
      const challenge = JSON.parse(row.payload_json) as T;
      const update = await getAppDb()
        .prepare(
          `UPDATE challenges
           SET payload_json = ?, consumed = 1, expires_at_ms = ?
           WHERE kind = ? AND request_id = ? AND consumed = 0 AND expires_at_ms > ?`,
        )
        .bind(
          JSON.stringify({ ...challenge, consumed: true }),
          now + 60_000,
          kind,
          requestId,
          now,
        )
        .run();
      if ((update.meta.changes ?? 0) === 0) return null;
      return challenge;
    },
  };
}
