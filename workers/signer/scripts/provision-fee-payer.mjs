#!/usr/bin/env node
/**
 * One-time: seal an existing fee-payer secret into phygital_signer D1.
 * Reads FEE_PAYER_SECRET_KEY from `.dev.vars` or the environment.
 *
 * Usage (from workers/signer/, signer worker running on :8788):
 *   node scripts/provision-fee-payer.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadDevVars() {
  const filePath = path.join(appDir, ".dev.vars");
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
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDevVars();

const origin = (process.env.SIGNER_ORIGIN ?? "http://127.0.0.1:8788").replace(
  /\/$/,
  "",
);
const token = process.env.SIGNER_INTERNAL_TOKEN?.trim();
const secretKey = process.env.FEE_PAYER_SECRET_KEY?.trim();

if (!token) {
  console.error("SIGNER_INTERNAL_TOKEN is required.");
  process.exit(1);
}
if (!secretKey) {
  console.error("FEE_PAYER_SECRET_KEY is required (from env or .dev.vars).");
  process.exit(1);
}

const response = await fetch(`${origin}/v1/provisionFeePayerKey`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({ secretKey }),
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  console.error(body.error ?? "Provision failed", response.status);
  process.exit(1);
}

console.log("Fee payer provisioned in signer D1.");
console.log(`publicKey=${body.publicKey}`);
