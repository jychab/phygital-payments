import { getAppDb } from "./app-db";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

export class IdempotencyConflictError extends Error {
  constructor(message = "Idempotency key reused with a different request") {
    super(message);
    this.name = "IdempotencyConflictError";
  }
}

function requestFingerprint(body: unknown): string {
  return JSON.stringify(body ?? null);
}

/** Return a cached JSON response body when the same key + route was seen. */
export async function readIdempotentResponse<T>(
  route: string,
  key: string,
): Promise<T | null> {
  const row = await getAppDb()
    .prepare(
      `SELECT response_json, expires_at_ms FROM idempotency_keys
       WHERE key = ? AND route = ?`,
    )
    .bind(key, route)
    .first<{ response_json: string; expires_at_ms: number }>();
  if (!row || Date.now() >= row.expires_at_ms) {
    if (row) {
      await getAppDb()
        .prepare(`DELETE FROM idempotency_keys WHERE key = ? AND route = ?`)
        .bind(key, route)
        .run();
    }
    return null;
  }
  return JSON.parse(row.response_json) as T;
}

export async function storeIdempotentResponse(
  route: string,
  key: string,
  fingerprint: string,
  response: unknown,
): Promise<void> {
  const existing = await getAppDb()
    .prepare(
      `SELECT fingerprint FROM idempotency_keys WHERE key = ? AND route = ?`,
    )
    .bind(key, route)
    .first<{ fingerprint: string }>();
  if (existing && existing.fingerprint !== fingerprint) {
    throw new IdempotencyConflictError();
  }
  await getAppDb()
    .prepare(
      `INSERT INTO idempotency_keys (key, route, fingerprint, response_json, expires_at_ms)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         route = excluded.route,
         fingerprint = excluded.fingerprint,
         response_json = excluded.response_json,
         expires_at_ms = excluded.expires_at_ms`,
    )
    .bind(
      key,
      route,
      fingerprint,
      JSON.stringify(response),
      Date.now() + IDEMPOTENCY_TTL_MS,
    )
    .run();
}

export function idempotencyKey(req: Request): string | null {
  const key = req.headers.get("Idempotency-Key")?.trim();
  return key ? key.slice(0, 128) : null;
}

export async function sweepIdempotencyKeys(nowMs = Date.now()): Promise<number> {
  const result = await getAppDb()
    .prepare(`DELETE FROM idempotency_keys WHERE expires_at_ms < ?`)
    .bind(nowMs)
    .run();
  return result.meta.changes ?? 0;
}

export { requestFingerprint };
