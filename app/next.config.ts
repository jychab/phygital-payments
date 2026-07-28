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

// Who may embed this app in an iframe. Standalone (top-level) use is unaffected
// by frame-ancestors. Override FRAME_ANCESTORS for local embedding tests
// (e.g. "http://localhost:3001"); production default is the Revibase vault.
const frameAncestors = process.env.FRAME_ANCESTORS ?? "https://app.revibase.com";

const nextConfig: NextConfig = {
  transpilePackages: ["phygital-payments-sdk", "phygital-token-sdk"],
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors ${frameAncestors};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
