/** React Query ↔ localStorage persistence (browser only). */

import { type Persister } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  defaultShouldDehydrateQuery,
  type Query,
} from "@tanstack/react-query";

/** Keep persisted cache at least this long (must match QueryClient `gcTime`). */
export const QUERY_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

const STORAGE_KEY = "phygital-pay.react-query";

/** Bump to drop incompatible cached shapes after schema changes. */
const CACHE_BUSTER = "v1";

export { CACHE_BUSTER };

/**
 * Sync localStorage persister. No-op during SSR (Next may evaluate providers
 * on the server; PersistQueryClientProvider still needs a Persister object).
 */
export function createQueryPersister(): Persister {
  if (typeof window === "undefined") {
    return {
      persistClient: async () => {},
      restoreClient: async () => undefined,
      removeClient: async () => {},
    };
  }

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: STORAGE_KEY,
  });
}

/** Skip non-JSON-safe values (e.g. `Map` from batch delegate status). */
export function shouldDehydrateQuery(query: Query): boolean {
  if (!defaultShouldDehydrateQuery(query)) return false;
  if (query.state.data instanceof Map) return false;
  return true;
}
