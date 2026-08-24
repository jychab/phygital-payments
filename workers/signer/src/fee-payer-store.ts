import { createKeyPairSignerFromBytes, getBase58Encoder } from "@solana/kit";

import { bytesToBase64 } from "./base64";
import { openSecret, sealSecret } from "./crypto";
import { requireEncryptionSecret, type SignerEnv } from "./env";
import { SignerError } from "./errors";

const FEE_PAYER_ROW_ID = "default";

type FeePayerRow = {
  public_key: string;
  secret_ciphertext: string;
  created_at_ms: number;
};

type CachedFeePayer = {
  publicKey: string;
  secretBase64: string;
};

/** Per-isolate cache keyed by the Worker env object. Recycle after external rotation. */
const feePayerCache = new WeakMap<SignerEnv, CachedFeePayer>();

function isByteArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    (value.length === 32 || value.length === 64) &&
    value.every(
      (byte) =>
        typeof byte === "number" &&
        Number.isInteger(byte) &&
        byte >= 0 &&
        byte <= 255,
    )
  );
}

export function parseSigningSecretKey(secret: string): Uint8Array {
  const trimmed = secret.trim();
  if (!trimmed) throw new Error("Missing fee payer secret key");
  if (trimmed.startsWith("[")) {
    const parsed: unknown = JSON.parse(trimmed);
    if (!isByteArray(parsed)) {
      throw new Error("Invalid fee payer secret key");
    }
    return Uint8Array.from(parsed);
  }
  return new Uint8Array(getBase58Encoder().encode(trimmed));
}

function rememberFeePayer(
  env: SignerEnv,
  publicKey: string,
  secretBytes: Uint8Array,
): CachedFeePayer {
  const cached = { publicKey, secretBase64: bytesToBase64(secretBytes) };
  feePayerCache.set(env, cached);
  return cached;
}

async function readFeePayerRow(env: SignerEnv): Promise<FeePayerRow | null> {
  return env.phygital_signer
    .prepare(
      `SELECT public_key, secret_ciphertext, created_at_ms
       FROM signer_fee_payer WHERE id = ?`,
    )
    .bind(FEE_PAYER_ROW_ID)
    .first<FeePayerRow>();
}

async function storeFeePayerKey(
  env: SignerEnv,
  publicKey: string,
  secretBytes: Uint8Array,
): Promise<void> {
  const secretCiphertext = await sealSecret(
    requireEncryptionSecret(env),
    bytesToBase64(secretBytes),
  );
  await env.phygital_signer
    .prepare(
      `INSERT INTO signer_fee_payer (id, public_key, secret_ciphertext, created_at_ms)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         public_key = excluded.public_key,
         secret_ciphertext = excluded.secret_ciphertext,
         created_at_ms = excluded.created_at_ms`,
    )
    .bind(FEE_PAYER_ROW_ID, publicKey, secretCiphertext, Date.now())
    .run();
  rememberFeePayer(env, publicKey, secretBytes);
}

/** Import a fee-payer secret and seal it in D1. */
export async function provisionFeePayerKey(
  env: SignerEnv,
  secretKey: string,
): Promise<{ publicKey: string }> {
  const secretBytes = parseSigningSecretKey(secretKey);
  const signer = await createKeyPairSignerFromBytes(secretBytes);
  const publicKey = String(signer.address);
  await storeFeePayerKey(env, publicKey, secretBytes);
  return { publicKey };
}

export async function getFeePayerPublicKey(
  env: SignerEnv,
): Promise<{ publicKey: string } | null> {
  const cached = feePayerCache.get(env);
  if (cached) return { publicKey: cached.publicKey };
  const row = await readFeePayerRow(env);
  if (!row) return null;
  return { publicKey: row.public_key };
}

/** Unseal the fee-payer private key for signing. Plaintext exists only in memory. */
export async function loadFeePayerSecret(
  env: SignerEnv,
): Promise<CachedFeePayer> {
  const cached = feePayerCache.get(env);
  if (cached) return cached;
  const row = await readFeePayerRow(env);
  if (!row) {
    throw new SignerError("Fee payer is not provisioned.", 503);
  }
  const secretBase64 = await openSecret(
    requireEncryptionSecret(env),
    row.secret_ciphertext,
  );
  const loaded = { publicKey: row.public_key, secretBase64 };
  feePayerCache.set(env, loaded);
  return loaded;
}
