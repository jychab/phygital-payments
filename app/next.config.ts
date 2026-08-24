import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Single local env source: Wrangler `.dev.vars` → `process.env`.
 * Next only auto-loads `.env*`; OpenNext/Wrangler only load `.dev.vars` into
 * Cloudflare `env`. This bridges them so `next dev` / `next build` match.
 * Values here overwrite any `.env*` Next already loaded.
 */
function loadDevVarsIntoProcessEnv() {
  const filePath = path.join(__dirname, ".dev.vars");
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadDevVarsIntoProcessEnv();

/** pnpm hoists `next` to the workspace root — Turbopack must resolve from there. */
const workspaceRoot = path.join(__dirname, "..");

const connectOrigins = [
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL.replace(/^http/, "ws"),
  process.env.NEXT_PUBLIC_API_ORIGIN,
]
  .map((value) => {
    const trimmed = value?.trim();
    if (!trimmed) return "";
    try {
      return new URL(trimmed).origin;
    } catch {
      return "";
    }
  })
  .filter(Boolean);
const connectSrc = ["'self'", ...connectOrigins].join(" ");

const nextConfig: NextConfig = {
  transpilePackages: ["phygital-token-sdk", "lazor-kit"],
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
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              `connect-src ${connectSrc}`,
              "img-src 'self' data: https:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
