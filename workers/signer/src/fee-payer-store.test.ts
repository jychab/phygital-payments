import { beforeEach, describe, expect, it } from "vitest";

import { createKeyPairSignerFromBytes } from "@solana/kit";
import { ed25519 } from "@noble/curves/ed25519.js";

import { bytesToBase64 } from "./base64";
import { sealSecret } from "./crypto";
import type { SignerEnv } from "./env";
import {
  getFeePayerPublicKey,
  loadFeePayerSecret,
  provisionFeePayerKey,
} from "./fee-payer-store";

describe("fee-payer-store", () => {
  const encryptionSecret = "test-encryption-secret";
  let feePayerRow: {
    public_key: string;
    secret_ciphertext: string;
    created_at_ms: number;
  } | null;
  let feePayerSelects = 0;

  function mockEnv() {
    return {
      phygital_signer: {
        prepare(sql: string) {
          const state = { binds: [] as unknown[] };
          return {
            bind(...args: unknown[]) {
              state.binds = args;
              return this;
            },
            async first() {
              if (!sql.includes("FROM signer_fee_payer") || !feePayerRow) {
                return null;
              }
              feePayerSelects += 1;
              return {
                id: "default",
                public_key: feePayerRow.public_key,
                secret_ciphertext: feePayerRow.secret_ciphertext,
                created_at_ms: feePayerRow.created_at_ms,
              };
            },
            async run() {
              if (sql.startsWith("INSERT INTO signer_fee_payer")) {
                const [, publicKey, secretCiphertext, createdAtMs] = state.binds as [
                  string,
                  string,
                  string,
                  number,
                ];
                feePayerRow = {
                  public_key: publicKey,
                  secret_ciphertext: secretCiphertext,
                  created_at_ms: createdAtMs,
                };
              }
              return { meta: { changes: 1 } };
            },
          };
        },
      },
      APP_ENCRYPTION_SECRET: encryptionSecret,
    } as unknown as SignerEnv;
  }

  function signingSecretBytes(fill: number): Uint8Array {
    const seed = new Uint8Array(32).fill(fill);
    const pub = ed25519.getPublicKey(seed);
    const full = new Uint8Array(64);
    full.set(seed, 0);
    full.set(pub, 32);
    return full;
  }

  beforeEach(() => {
    feePayerRow = null;
    feePayerSelects = 0;
  });

  it("provisionFeePayerKey seals an imported secret", async () => {
    const env = mockEnv();
    const full = signingSecretBytes(3);
    const signer = await createKeyPairSignerFromBytes(full);
    const imported = await provisionFeePayerKey(
      env,
      JSON.stringify(Array.from(full)),
    );
    expect(imported.publicKey).toBe(String(signer.address));
    expect(feePayerRow?.secret_ciphertext.startsWith("enc:v1:")).toBe(true);
    const loaded = await loadFeePayerSecret(env);
    expect(loaded.publicKey).toBe(String(signer.address));
    expect(loaded.secretBase64).toBe(bytesToBase64(full));
  });

  it("provisionFeePayerKey rejects a non-byte JSON array", async () => {
    const env = mockEnv();
    await expect(provisionFeePayerKey(env, "[1,2,3]")).rejects.toThrow(
      /invalid fee payer secret key/i,
    );
  });

  it("getFeePayerPublicKey reads stored pubkey", async () => {
    const env = mockEnv();
    const { publicKey } = await provisionFeePayerKey(
      env,
      JSON.stringify(Array.from(signingSecretBytes(5))),
    );
    expect(await getFeePayerPublicKey(env)).toEqual({ publicKey });
  });

  it("loadFeePayerSecret round-trips sealed material", async () => {
    const env = mockEnv();
    const plain = bytesToBase64(new Uint8Array(64).fill(9));
    feePayerRow = {
      public_key: "pub",
      secret_ciphertext: await sealSecret(encryptionSecret, plain),
      created_at_ms: Date.now(),
    };
    const loaded = await loadFeePayerSecret(env);
    expect(loaded.secretBase64).toBe(plain);
  });

  it("loadFeePayerSecret reuses isolate cache for the same env", async () => {
    const env = mockEnv();
    const plain = bytesToBase64(new Uint8Array(64).fill(9));
    feePayerRow = {
      public_key: "pub",
      secret_ciphertext: await sealSecret(encryptionSecret, plain),
      created_at_ms: Date.now(),
    };
    expect((await loadFeePayerSecret(env)).secretBase64).toBe(plain);
    expect(feePayerSelects).toBe(1);
    await loadFeePayerSecret(env);
    await getFeePayerPublicKey(env);
    expect(feePayerSelects).toBe(1);
  });
});
