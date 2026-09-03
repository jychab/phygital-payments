import { getEnv } from "@/shared/request-context";
import {
  parseCounterState,
  type CounterState,
} from "@/tap/counter-session";

/**
 * KV-backed high-water mark for tap anti-replay (counter only, no TTL).
 * Remounts are authorized by the session cookie. Uses the shared
 * `revibase_counter` namespace (same as vault / developer mint).
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

/** Persist a newly consumed counter. */
export async function writeCounterSession(
  publicKey: string,
  state: CounterState,
): Promise<void> {
  await getCounterKv().put(publicKey, JSON.stringify({ c: state.c }));
}
