import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Exposes Cloudflare bindings (incl. the TRANSFER_SUBMITTER Durable Object)
// to `next dev` via getCloudflareContext(). Uses the dev-only wrangler config
// whose `main` exports the DO class directly (the production entry imports the
// not-yet-built `.open-next/worker.js`). No-op in production builds.
void initOpenNextCloudflareForDev();

/** pnpm hoists `next` to the workspace root — Turbopack must resolve from there. */
const workspaceRoot = path.join(__dirname, "..");

const nextConfig: NextConfig = {
  transpilePackages: ["phygital-payments-sdk", "phygital-token-sdk"],
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
