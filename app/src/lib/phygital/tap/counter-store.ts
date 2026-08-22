import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import {
  parseCounterState,
  type CounterState,
} from "@/lib/phygital/tap/counter-session";

/**
 * KV-backed counter session for tap anti-replay.
 * Uses the shared `revibase_counter` namespace (same as vault / developer mint).
 * Keyed by chip public key (`pk`); value is `{ c, t }`.
 */

function getCounterKv(): KVNamespace {
  const kv = getCloudflareContext().env.revibase_counter;
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
