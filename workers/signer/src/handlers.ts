import { createKeyPairSignerFromBytes } from "@solana/kit";
import { verifyResponse } from "phygital-token-sdk";

import { bytesToBase64, bytesToBase64Url } from "./base64";
import { newEd25519SecretBytes, openSecret, sealSecret } from "./crypto";
import { requireEncryptionSecret, type SignerEnv } from "./env";
import { SIGNER_REQUEST_EXPIRED, SignerError } from "./errors";
import { loadFeePayerSecret } from "./fee-payer-store";
import {
  decodeWireTransaction,
  signFeePayerTransaction,
  signSessionTransaction,
} from "./sign";
import type {
  SignerCreateChallengeResult,
  SignerCreateSessionKeyRequest,
  SignerCreateSessionKeyResult,
  SignerDestroySessionKeyRequest,
  SignerPeekChallengeResult,
  SignerSignFeePayerRequest,
  SignerSignFeePayerResult,
  SignerSignSessionRequest,
  SignerSignSessionResult,
} from "./protocol";

const CHALLENGE_TTL_MS = 2 * 60 * 1000;
const CONSUMED_CHALLENGE_TTL_MS = 60_000;

type WebAuthnResponse = Parameters<typeof verifyResponse>[0]["response"];

type NfcChallenge = {
  requestId: string;
  challenge: string;
  expiresAtMs: number;
  consumed: boolean;
};

type ChallengeRow = {
  request_id: string;
  challenge: string;
  expires_at_ms: number;
  consumed: number;
};

type SignerKeyRow = {
  session_public_key: string;
  secret_ciphertext: string;
};

function toNfcChallenge(row: ChallengeRow): NfcChallenge {
  return {
    requestId: row.request_id,
    challenge: row.challenge,
    expiresAtMs: row.expires_at_ms,
    consumed: row.consumed !== 0,
  };
}

async function selectChallengeRow(
  db: D1Database,
  requestId: string,
): Promise<ChallengeRow | null> {
  return db
    .prepare(
      `SELECT request_id, challenge, expires_at_ms, consumed
       FROM signer_challenges WHERE request_id = ?`,
    )
    .bind(requestId)
    .first<ChallengeRow>();
}

async function getChallengeRow(
  db: D1Database,
  requestId: string,
): Promise<NfcChallenge | null> {
  const row = await selectChallengeRow(db, requestId);
  if (!row) return null;
  if (Date.now() >= row.expires_at_ms) {
    await db
      .prepare(`DELETE FROM signer_challenges WHERE request_id = ?`)
      .bind(requestId)
      .run();
    return null;
  }
  return toNfcChallenge(row);
}

async function consumeChallenge(
  db: D1Database,
  requestId: string,
): Promise<boolean> {
  const now = Date.now();
  const update = await db
    .prepare(
      `UPDATE signer_challenges
       SET consumed = 1, expires_at_ms = ?
       WHERE request_id = ? AND consumed = 0 AND expires_at_ms > ?`,
    )
    .bind(now + CONSUMED_CHALLENGE_TTL_MS, requestId, now)
    .run();
  return (update.meta.changes ?? 0) !== 0;
}

export async function handleCreateChallenge(
  env: SignerEnv,
  origin: string,
): Promise<SignerCreateChallengeResult> {
  const requestId = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const nfcChallenge = crypto.randomUUID();
  const now = Date.now();
  const expiresAtMs = now + CHALLENGE_TTL_MS;
  await env.phygital_signer
    .prepare(
      `INSERT INTO signer_challenges
       (request_id, challenge, origin, created_at_ms, expires_at_ms, consumed)
       VALUES (?, ?, ?, ?, ?, 0)`,
    )
    .bind(requestId, nfcChallenge, origin.slice(0, 200), now, expiresAtMs)
    .run();
  return { requestId, challenge: nfcChallenge, expiresAtMs };
}

export async function handleGetChallengeStatus(
  env: SignerEnv,
  requestId: string,
): Promise<{ requestId: string; expiresAtMs: number; active: boolean } | null> {
  const stored = await getChallengeRow(env.phygital_signer, requestId);
  if (!stored || stored.consumed) return null;
  return {
    requestId: stored.requestId,
    expiresAtMs: stored.expiresAtMs,
    active: true,
  };
}

export async function handlePeekChallenge(
  env: SignerEnv,
  requestId: string,
): Promise<SignerPeekChallengeResult | null> {
  const stored = await getChallengeRow(env.phygital_signer, requestId);
  if (!stored) return null;
  return {
    requestId: stored.requestId,
    challenge: stored.challenge,
    expiresAtMs: stored.expiresAtMs,
    consumed: stored.consumed,
  };
}

export async function handleCreateSessionKey(
  env: SignerEnv,
  body: SignerCreateSessionKeyRequest,
): Promise<SignerCreateSessionKeyResult> {
  const phygitalPasskey = body.phygitalPasskey.trim();
  const vaultPda = body.vaultPda.trim();
  const walletPda = body.walletPda.trim();
  if (!phygitalPasskey || !vaultPda || !walletPda || !body.expiresAtSlot) {
    throw new Error("Missing session key fields");
  }

  const secretBytes = newEd25519SecretBytes();
  const signer = await createKeyPairSignerFromBytes(secretBytes);
  const sessionKey = Uint8Array.from(secretBytes.subarray(32, 64));
  const sessionPublicKey = String(signer.address);
  const secretCiphertext = await sealSecret(
    requireEncryptionSecret(env),
    bytesToBase64(secretBytes),
  );

  await env.phygital_signer
    .prepare(
      `INSERT INTO signer_keys (
         phygital_passkey, vault_pda, wallet_pda, session_public_key,
         secret_ciphertext, expires_at_slot, created_at_ms
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(phygital_passkey) DO UPDATE SET
         vault_pda = excluded.vault_pda,
         wallet_pda = excluded.wallet_pda,
         session_public_key = excluded.session_public_key,
         secret_ciphertext = excluded.secret_ciphertext,
         expires_at_slot = excluded.expires_at_slot,
         created_at_ms = excluded.created_at_ms`,
    )
    .bind(
      phygitalPasskey,
      vaultPda,
      walletPda,
      sessionPublicKey,
      secretCiphertext,
      body.expiresAtSlot,
      Date.now(),
    )
    .run();

  return {
    sessionPublicKey,
    sessionKey: bytesToBase64Url(sessionKey),
  };
}

export async function handleDestroySessionKey(
  env: SignerEnv,
  body: SignerDestroySessionKeyRequest,
): Promise<{ ok: true }> {
  const phygitalPasskey = body.phygitalPasskey.trim();
  if (!phygitalPasskey) throw new Error("Missing phygital passkey");
  await env.phygital_signer
    .prepare(`DELETE FROM signer_keys WHERE phygital_passkey = ?`)
    .bind(phygitalPasskey)
    .run();
  return { ok: true };
}

async function loadKeyByPasskey(
  env: SignerEnv,
  phygitalPasskey: string,
): Promise<{ row: SignerKeyRow; sessionSecret: string } | null> {
  const row = await env.phygital_signer
    .prepare(
      `SELECT session_public_key, secret_ciphertext
       FROM signer_keys WHERE phygital_passkey = ?`,
    )
    .bind(phygitalPasskey)
    .first<SignerKeyRow>();
  if (!row) return null;
  const sessionSecret = await openSecret(
    requireEncryptionSecret(env),
    row.secret_ciphertext,
  );
  return { row, sessionSecret };
}

export async function handleSignSession(
  env: SignerEnv,
  body: SignerSignSessionRequest,
): Promise<SignerSignSessionResult> {
  if (!body.requestId || body.webauthnResponse == null || !body.transaction) {
    throw new Error("Missing sign session fields");
  }
  if (!body.sessionPublicKey || !body.feePayer) {
    throw new Error("Missing session public key or fee payer");
  }

  const stored = await getChallengeRow(env.phygital_signer, body.requestId);
  if (!stored || stored.consumed) {
    throw new SignerError(SIGNER_REQUEST_EXPIRED, 410);
  }

  const verified = verifyResponse({
    expectedMessage: stored.challenge,
    response: body.webauthnResponse as WebAuthnResponse,
  });
  if (!verified.isVerified || !verified.secp256r1PublicKey) {
    throw new SignerError("Couldn’t verify this accessory.", 400);
  }

  const phygitalPasskey = verified.secp256r1PublicKey.trim();
  const [key, feePayer] = await Promise.all([
    loadKeyByPasskey(env, phygitalPasskey),
    loadFeePayerSecret(env),
  ]);
  if (!key) {
    throw new SignerError("No session key for this accessory.", 403);
  }
  if (key.row.session_public_key !== body.sessionPublicKey) {
    throw new SignerError("Session key mismatch.", 403);
  }

  const consumed = await consumeChallenge(env.phygital_signer, body.requestId);
  if (!consumed) {
    throw new SignerError(SIGNER_REQUEST_EXPIRED, 410);
  }

  const signed = await signSessionTransaction({
    sessionSecretBase64: key.sessionSecret,
    sessionPublicKey: body.sessionPublicKey,
    feePayerPublicKey: feePayer.publicKey,
    feePayerSecretBase64: feePayer.secretBase64,
    feePayer: body.feePayer,
    transaction: decodeWireTransaction(body.transaction),
  });

  return { transaction: signed };
}

export async function handleSignFeePayer(
  env: SignerEnv,
  body: SignerSignFeePayerRequest,
): Promise<SignerSignFeePayerResult> {
  if (!body.transaction) throw new Error("Missing transaction");
  const feePayer = await loadFeePayerSecret(env);
  const signed = await signFeePayerTransaction({
    feePayerSecretBase64: feePayer.secretBase64,
    feePayerPublicKey: feePayer.publicKey,
    transaction: decodeWireTransaction(body.transaction),
  });
  return { transaction: signed };
}
