import { getEnv } from "@/platform/request-context";

/**
 * App D1 (`phygital_app`): agents, passkeys, challenges, NFC counters.
 * Tap reentry grace stays on `revibase_counter` KV — see counter-store.
 */
export function getAppDb(): D1Database {
  const db = getEnv().phygital_app;
  if (!db) {
    throw new Error("D1 binding phygital_app is not configured");
  }
  return db;
}
