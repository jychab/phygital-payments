/**
 * Server-side counter session for tap verification (shared with vault /
 * `revibase_counter` KV). A chip counter is single-use, but one physical tap
 * may be re-checked (page remount). The most recent counter stays re-verifiable
 * for a grace window; afterwards presenting it again is a replay.
 *
 * Pure logic (no KV) — `counter-store` owns IO.
 */

export const TAP_SESSION_TTL_MS = 15 * 60 * 1000;

export type CounterState = {
  /** Highest verified counter for this chip. */
  c: number;
  /** When that counter was first verified, ms since epoch. */
  t: number;
};

export type CounterVerdict = "new" | "reentry" | "replay";

/** Parse stored KV JSON `{ c, t }` (accepts numeric strings from mint seed). */
export function parseCounterState(raw: string | null): CounterState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CounterState> & {
      c?: unknown;
      t?: unknown;
    };
    const c =
      typeof parsed.c === "number"
        ? parsed.c
        : typeof parsed.c === "string"
          ? Number(parsed.c)
          : NaN;
    const t =
      typeof parsed.t === "number"
        ? parsed.t
        : typeof parsed.t === "string"
          ? Number(parsed.t)
          : NaN;
    if (Number.isFinite(c) && Number.isFinite(t)) {
      return { c, t };
    }
  } catch {
    // Legacy plain decimal string (mint / early writers).
    const asNumber = Number(raw);
    if (Number.isFinite(asNumber)) {
      return { c: asNumber, t: 0 };
    }
  }
  return null;
}

/**
 * Judge an incoming counter against the stored session.
 * - `new`: counter > stored (or no state) — consume and advance KV
 * - `reentry`: same counter inside the grace window — allow remount
 * - `replay`: stale / lower / expired same counter — reject
 */
export function evaluateCounter(
  state: CounterState | null,
  counter: number,
  now: number,
  ttl: number = TAP_SESSION_TTL_MS,
): CounterVerdict {
  if (!state || counter > state.c) return "new";
  if (counter === state.c && now - state.t <= ttl) return "reentry";
  return "replay";
}
