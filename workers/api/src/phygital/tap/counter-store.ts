import {
  parseCounterState,
  type CounterState,
} from "@/phygital/tap/counter-session";
import { getEnv } from "@/platform/request-context";

/**
 * KV-backed counter session for tap anti-replay reentry grace.
 * `revibase_counter` is the shared chip counter store across products.
 * Strict monotonic advance lives in D1 (`tryAdvanceD1Counter`).
 * Keyed by chip public key (`pk`); value is `{ c, t }`.
 */

function getCounterKv(): KVNamespace {
  const kv = getEnv().revibase_counter;
  if (!kv) {
    throw new Error("KV binding revibase_counter is not configured");
  }
  return kv;
}

export async function readCounterSession(
  publicKey: string,
): Promise<CounterState | null> {
  return parseCounterState(await getCounterKv().get(publicKey));
}

/** Persist a newly consumed counter (first verification only, not reentry). */
export async function writeCounterSession(
  publicKey: string,
  state: CounterState,
): Promise<void> {
  await getCounterKv().put(publicKey, JSON.stringify(state));
}
