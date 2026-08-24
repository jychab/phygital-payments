import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("phygital-token-sdk", () => ({
  verifyResponse: vi.fn(),
}));

import { verifyResponse } from "phygital-token-sdk";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { ed25519 } from "@noble/curves/ed25519.js";

import { bytesToBase64 } from "./base64";
import { sealSecret } from "./crypto";
import type { SignerEnv } from "./env";

describe("signer handlers", () => {
  const encryptionSecret = "test-encryption-secret";

  let db: {
    challenges: Map<
      string,
      {
        challenge: string;
        origin: string;
        createdAtMs: number;
        expiresAtMs: number;
        consumed: number;
      }
    >;
    keys: Map<
      string,
      {
        phygital_passkey: string;
        vault_pda: string;
        wallet_pda: string;
        session_public_key: string;
        secret_ciphertext: string;
        expires_at_slot: string;
        created_at_ms: number;
      }
    >;
    feePayer: {
      public_key: string;
      secret_ciphertext: string;
      created_at_ms: number;
    } | null;
  };

  async function seedFeePayer() {
    const seed = new Uint8Array(32).fill(7);
    const pub = ed25519.getPublicKey(seed);
    const full = new Uint8Array(64);
    full.set(seed, 0);
    full.set(pub, 32);
    const signer = await createKeyPairSignerFromBytes(full);
    db.feePayer = {
      public_key: String(signer.address),
      secret_ciphertext: await sealSecret(encryptionSecret, bytesToBase64(full)),
      created_at_ms: Date.now(),
    };
    return String(signer.address);
  }

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
              if (sql.includes("FROM signer_challenges")) {
                const id = state.binds[0] as string;
                const row = db.challenges.get(id);
                if (!row) return null;
                return {
                  request_id: id,
                  challenge: row.challenge,
                  origin: row.origin,
                  created_at_ms: row.createdAtMs,
                  expires_at_ms: row.expiresAtMs,
                  consumed: row.consumed,
                };
              }
              if (sql.includes("FROM signer_keys")) {
                const pk = state.binds[0] as string;
                return db.keys.get(pk) ?? null;
              }
              if (sql.includes("FROM signer_fee_payer")) {
                if (!db.feePayer) return null;
                return {
                  id: "default",
                  public_key: db.feePayer.public_key,
                  secret_ciphertext: db.feePayer.secret_ciphertext,
                  created_at_ms: db.feePayer.created_at_ms,
                };
              }
              return null;
            },
            async run() {
              if (sql.startsWith("INSERT INTO signer_challenges")) {
                const [requestId, challenge, origin, createdAtMs, expiresAtMs] =
                  state.binds as [string, string, string, number, number];
                db.challenges.set(requestId, {
                  challenge,
                  origin,
                  createdAtMs,
                  expiresAtMs,
                  consumed: 0,
                });
              }
              if (sql.startsWith("INSERT INTO signer_keys")) {
                const [
                  phygitalPasskey,
                  vaultPda,
                  walletPda,
                  sessionPublicKey,
                  secretCiphertext,
                  expiresAtSlot,
                  createdAtMs,
                ] = state.binds as [
                  string,
                  string,
                  string,
                  string,
                  string,
                  string,
                  number,
                ];
                db.keys.set(phygitalPasskey, {
                  phygital_passkey: phygitalPasskey,
                  vault_pda: vaultPda,
                  wallet_pda: walletPda,
                  session_public_key: sessionPublicKey,
                  secret_ciphertext: secretCiphertext,
                  expires_at_slot: expiresAtSlot,
                  created_at_ms: createdAtMs,
                });
              }
              if (sql.startsWith("INSERT INTO signer_fee_payer")) {
                const [, publicKey, secretCiphertext, createdAtMs] = state.binds as [
                  string,
                  string,
                  string,
                  number,
                ];
                db.feePayer = {
                  public_key: publicKey,
                  secret_ciphertext: secretCiphertext,
                  created_at_ms: createdAtMs,
                };
              }
              if (sql.startsWith("UPDATE signer_challenges")) {
                const [, requestId] = state.binds as [number, string];
                const row = db.challenges.get(requestId);
                if (row && row.consumed === 0) {
                  row.consumed = 1;
                  return { meta: { changes: 1 } };
                }
                return { meta: { changes: 0 } };
              }
              return { meta: { changes: 1 } };
            },
          };
        },
      },
      APP_ENCRYPTION_SECRET: encryptionSecret,
    } as unknown as SignerEnv;
  }

  beforeEach(() => {
    db = { challenges: new Map(), keys: new Map(), feePayer: null };
    vi.mocked(verifyResponse).mockReset();
  });

  it("createSessionKey returns public material only", async () => {
    const { handleCreateSessionKey } = await import("./handlers");
    const env = mockEnv();
    const result = await handleCreateSessionKey(env, {
      phygitalPasskey: "pk-test",
      vaultPda: "vault",
      walletPda: "wallet",
      expiresAtSlot: "999",
    });
    expect(result.sessionPublicKey).toBeTruthy();
    expect(result.sessionKey).toBeTruthy();
    expect(db.keys.has("pk-test")).toBe(true);
    const stored = db.keys.get("pk-test")!;
    expect(stored.secret_ciphertext.startsWith("enc:v1:")).toBe(true);
  });

  it("signSession rejects without webauthn verification", async () => {
    const { handleCreateChallenge, handleSignSession } = await import("./handlers");
    const env = mockEnv();
    await seedFeePayer();
    const created = await handleCreateChallenge(env, "test");
    vi.mocked(verifyResponse).mockReturnValue({
      isVerified: false,
      secp256r1PublicKey: "",
    });

    await expect(
      handleSignSession(env, {
        requestId: created.requestId,
        webauthnResponse: {},
        transaction: "AAAA",
        sessionPublicKey: "abc",
        feePayer: db.feePayer!.public_key,
      }),
    ).rejects.toMatchObject({ message: /verify/i, status: 400 });
  });

  it("signSession rejects when no key is bound to the tapped accessory", async () => {
    const { handleCreateChallenge, handleSignSession } = await import("./handlers");
    const env = mockEnv();
    await seedFeePayer();
    const created = await handleCreateChallenge(env, "test");
    vi.mocked(verifyResponse).mockReturnValue({
      isVerified: true,
      secp256r1PublicKey: "unknown-pk",
    });

    await expect(
      handleSignSession(env, {
        requestId: created.requestId,
        webauthnResponse: { ok: true },
        transaction: "AAAA",
        sessionPublicKey: "abc",
        feePayer: db.feePayer!.public_key,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
