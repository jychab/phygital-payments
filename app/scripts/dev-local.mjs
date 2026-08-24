#!/usr/bin/env node
/**
 * Local dev: signer worker + API worker + Next.js.
 * Matches production topology with a dedicated signing layer.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(appDir, "..");
const signerPort = process.env.PHYGITAL_SIGNER_DEV_PORT ?? "8788";
const apiPort = process.env.PHYGITAL_API_DEV_PORT ?? "8787";
const signerOrigin = `http://127.0.0.1:${signerPort}`;
const apiOrigin = `http://localhost:${apiPort}`;

const children = [];

function run(name, command, args, env = {}, cwd = appDir) {
  const child = spawn(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code, signal) => {
    if (signal) return;
    if (code && code !== 0) shutdown(code);
  });
  children.push({ name, child });
  return child;
}

function shutdown(code = 0) {
  for (const { child } of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}

/** Resolves when `url` accepts TCP (any HTTP status). */
async function waitUntilReachable(url, label, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fetch(url, { signal: AbortSignal.timeout(1500) });
      console.log(`${label} ready`);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  throw new Error(`Timed out waiting for ${label} at ${url}`);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  console.log(`Starting signer worker on ${signerOrigin}…`);
  run("signer", "pnpm", [
    "--filter",
    "@phygital/signer-worker",
    "exec",
    "wrangler",
    "dev",
    "-c",
    "wrangler.jsonc",
    "--env",
    "dev",
    "--port",
    signerPort,
  ], {}, workspaceRoot);

  await waitUntilReachable(signerOrigin, "Signer");

  console.log(`Starting API worker on ${apiOrigin}…`);
  run("api", "pnpm", [
    "--filter",
    "@phygital/api-worker",
    "exec",
    "wrangler",
    "dev",
    "-c",
    "wrangler.jsonc",
    "--env",
    "dev",
    "--port",
    apiPort,
  ], {}, workspaceRoot);

  await waitUntilReachable(apiOrigin, "API");

  console.log("Starting Next.js dev server (UI only)…");
  run("next", "pnpm", ["next", "dev"], {
    NEXT_PUBLIC_API_ORIGIN:
      process.env.NEXT_PUBLIC_API_ORIGIN ?? apiOrigin,
  });
}

main().catch((error) => {
  console.error(error);
  shutdown(1);
});
