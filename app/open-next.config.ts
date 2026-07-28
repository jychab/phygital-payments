import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Minimal config: the app is wallet-dynamic and does not rely on ISR/SSG
// caching, so no incremental-cache override (e.g. R2) is wired up for v1.
// Add `incrementalCache: r2IncrementalCache` here later if ISR is introduced.
export default defineCloudflareConfig({});
