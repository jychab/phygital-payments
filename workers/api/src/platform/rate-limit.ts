import { getEnv } from "@/platform/request-context";
import { apiJson, corsJson } from "./api-response";
import { getAppDb } from "./app-db";

export class RateLimitError extends Error {
  constructor(message = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}

export const rateLimitPresets = {
  /** Public read proxies (tokens, verify-tap GET). */
  publicRead: {
    binding: "PUBLIC_READ_LIMITER",
    max: 60,
    windowMs: 60_000,
  },
  /** Challenge mint and other unauthenticated writes. */
  publicWrite: {
    binding: "PUBLIC_WRITE_LIMITER",
    max: 20,
    windowMs: 60_000,
  },
  /** Authenticated sponsor submissions per vault. */
  sponsor: { binding: "SPONSOR_LIMITER", max: 10, windowMs: 60_000 },
  /** Authenticated wallet reads (portfolio, grant list, dashboard). */
  walletRead: { max: 120, windowMs: 60_000 },
  /** Wallet session writes (grant, passkey). */
  walletWrite: { max: 30, windowMs: 60_000 },
  /** modifyAndSign per IP. */
  agentSign: { max: 30, windowMs: 60_000 },
  /** createWallet-only batches without session (signup). */
  createWallet: { max: 5, windowMs: 3_600_000 },
} as const;

type Preset = (typeof rateLimitPresets)[keyof typeof rateLimitPresets];

function windowStart(nowMs: number, windowMs: number): number {
  return Math.floor(nowMs / windowMs) * windowMs;
}

async function limitViaD1(
  bucketKey: string,
  preset: Preset,
  nowMs = Date.now(),
): Promise<boolean> {
  const start = windowStart(nowMs, preset.windowMs);
  const row = await getAppDb()
    .prepare(
      `INSERT INTO rate_limit_buckets (bucket_key, window_start_ms, count)
       VALUES (?, ?, 1)
       ON CONFLICT(bucket_key, window_start_ms) DO UPDATE SET
         count = count + 1
       RETURNING count`,
    )
    .bind(bucketKey, start)
    .first<{ count: number }>();
  return (row?.count ?? 0) <= preset.max;
}

async function limitViaBinding(
  env: CloudflareEnv,
  bindingName: "PUBLIC_READ_LIMITER" | "PUBLIC_WRITE_LIMITER" | "SPONSOR_LIMITER",
  key: string,
): Promise<boolean | null> {
  const limiter = env[bindingName];
  if (!limiter || typeof limiter !== "object" || !("limit" in limiter)) {
    return null;
  }
  const outcome = await limiter.limit({ key });
  return outcome.success;
}

/**
 * Returns true when the request is allowed. Throws RateLimitError when blocked.
 */
export async function assertRateLimit(
  bucketKey: string,
  preset: Preset,
): Promise<void> {
  const env = getEnv();

  if ("binding" in preset) {
    const bindingOk = await limitViaBinding(env, preset.binding, bucketKey);
    if (bindingOk === false) {
      throw new RateLimitError();
    }
    if (bindingOk === true) return;
  }

  const ok = await limitViaD1(bucketKey, preset);
  if (!ok) throw new RateLimitError();
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/** Apply a rate limit; returns a 429 response when blocked. */
export async function rateLimitOrResponse(
  req: Request,
  preset: Preset,
  key?: string,
  options?: { publicCors?: boolean },
): Promise<Response | null> {
  try {
    await assertRateLimit(key ?? clientIp(req), preset);
    return null;
  } catch (error) {
    if (error instanceof RateLimitError) {
      const body = { error: "Too many requests. Try again shortly." };
      return options?.publicCors
        ? corsJson(body, 429)
        : apiJson(body, 429);
    }
    throw error;
  }
}

/** Delete expired rate-limit windows (scheduled task). */
export async function sweepRateLimitBuckets(
  olderThanMs: number,
  nowMs = Date.now(),
): Promise<number> {
  const cutoff = nowMs - olderThanMs;
  const result = await getAppDb()
    .prepare(`DELETE FROM rate_limit_buckets WHERE window_start_ms < ?`)
    .bind(cutoff)
    .run();
  return result.meta.changes ?? 0;
}
