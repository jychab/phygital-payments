#!/usr/bin/env node
/**
 * Full worker dev: OpenNext build + signer + API + pages workers.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(appDir, "..");
const children = [];

function run(command, args, opts = {}) {
  const child = spawn(command, args, {
    cwd: opts.cwd ?? appDir,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...opts,
  });
  children.push(child);
  child.on("exit", (code) => {
    if (code && code !== 0) shutdown(code);
  });
  return child;
}

function shutdown(code = 0) {
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  process.exit(code);
}

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

console.log("Building OpenNext worker bundle…");
const build = run("pnpm", ["opennextjs-cloudflare", "build"], {
  stdio: "inherit",
});

build.on("exit", (code) => {
  if (code !== 0) shutdown(code ?? 1);

  void (async () => {
    try {
      console.log("Starting signer worker on :8788…");
      run("pnpm", [
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
        "8788",
      ], { cwd: workspaceRoot });
      await waitUntilReachable("http://127.0.0.1:8788", "Signer");

      console.log("Starting API worker on :8787…");
      run("pnpm", [
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
        "8787",
      ], { cwd: workspaceRoot });
      await waitUntilReachable("http://127.0.0.1:8787", "API");

      console.log("Starting pages worker on :3000…");
      run("pnpm", ["wrangler", "dev", "-c", "wrangler.jsonc", "--port", "3000"]);
    } catch (error) {
      console.error(error);
      shutdown(1);
    }
  })();
});
