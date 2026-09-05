/**
 * Simple KV sliding-window counters for auth abuse (register / login / link).
 * Fail-open if KV is missing so local/dev without binding still works.
 */
import { getEnv } from "@/shared/request-context";

const WINDOW_SECONDS = 60;
const MAX_HITS = 30;

function clientKey(c: { req: { header: (n: string) => string | undefined } }): string {
  const cf = c.req.header("CF-Connecting-IP")?.trim();
  if (cf) return cf;
  const xff = c.req.header("X-Forwarded-For")?.split(",")[0]?.trim();
  if (xff) return xff;
  return "unknown";
}

/** Returns a 429 Response when over limit, else null. */
export async function denyIfAuthRateLimited(
  c: {
    req: { header: (n: string) => string | undefined };
  },
  bucket: string,
): Promise<Response | null> {
  const kv = getEnv().revibase_counter;
  if (!kv) return null;

  const id = clientKey(c);
  const key = `auth-rl:${bucket}:${id}`;
  const raw = await kv.get(key);
  const hits = raw ? Number(raw) : 0;
  if (Number.isFinite(hits) && hits >= MAX_HITS) {
    return new Response(
      JSON.stringify({
        error: "Too many attempts. Try again in a minute.",
        code: "rate_limited",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(WINDOW_SECONDS),
        },
      },
    );
  }

  const next = (Number.isFinite(hits) ? hits : 0) + 1;
  await kv.put(key, String(next), { expirationTtl: WINDOW_SECONDS });
  return null;
}
