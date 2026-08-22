import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getAppKv(): KVNamespace {
  const kv = getCloudflareContext().env.revibase_counter;
  if (!kv) {
    throw new Error("KV binding revibase_counter is not configured");
  }
  return kv;
}
