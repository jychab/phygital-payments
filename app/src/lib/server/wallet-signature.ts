import "server-only";

import { getBase64Encoder } from "@solana/kit";
import { p256 } from "@noble/curves/nist.js";

import { base64ToBytes, bytesToBase64Url } from "@/lib/crypto/base64";
import { tryParseAddress } from "@/lib/solana/address";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { decodeAuthorityAccount } from "@/lib/lazorkit/accounts";
import { sha256, concatBytes } from "@/lib/lazorkit/bytes";
import { credentialIdHash, findVaultAndAuthorityPdas } from "@/lib/lazorkit/pdas";

export const WALLET_MESSAGE_MAX_AGE_MS = 5 * 60 * 1000;

export class WalletSignatureError extends Error {
  readonly status: 400 | 401;

  constructor(message: string, status: 400 | 401) {
    super(message);
    this.name = "WalletSignatureError";
    this.status = status;
  }
}

export function isWalletSignatureError(
  error: unknown,
): error is WalletSignatureError {
  return error instanceof WalletSignatureError;
}

/** Reject a signed message whose unix-ms timestamp is missing or too old. */
export function requireFreshTimestamp(tsRaw: string): void {
  const ts = Number(tsRaw);
  if (
    !Number.isFinite(ts) ||
    Math.abs(Date.now() - ts) > WALLET_MESSAGE_MAX_AGE_MS
  ) {
    throw new WalletSignatureError("Message expired", 400);
  }
}

export type PasskeyAssertionBody = {
  wallet: string;
  walletPda: string;
  credentialId: string;
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
};

function field(json: unknown, key: string): string | null {
  if (!json || typeof json !== "object" || !(key in json)) return null;
  const value = (json as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

/**
 * Verify a WebAuthn assertion against the LazorKit authority pubkey for
 * `walletPda`, and that `wallet` is that wallet's vault PDA.
 */
export async function requirePasskeyAssertion(args: {
  wallet: string;
  walletPda: string;
  credentialIdB64: string;
  message: string;
  authenticatorDataB64: string;
  clientDataJSONB64: string;
  signatureB64: string;
}): Promise<void> {
  const vault = tryParseAddress(args.wallet);
  const walletPda = tryParseAddress(args.walletPda);
  if (!vault || !walletPda) {
    throw new WalletSignatureError("Invalid wallet", 400);
  }

  let credentialId: Uint8Array;
  let authenticatorData: Uint8Array;
  let clientDataJSON: Uint8Array;
  let signature: Uint8Array;
  try {
    credentialId = base64ToBytes(args.credentialIdB64);
    authenticatorData = base64ToBytes(args.authenticatorDataB64);
    clientDataJSON = base64ToBytes(args.clientDataJSONB64);
    signature = base64ToBytes(args.signatureB64);
  } catch {
    throw new WalletSignatureError("Invalid signature", 400);
  }
  if (signature.length !== 64) {
    throw new WalletSignatureError("Invalid signature", 400);
  }

  const credHash = await credentialIdHash(credentialId);
  const pdas = await findVaultAndAuthorityPdas({
    walletPda,
    credentialIdHash: credHash,
  });
  if (pdas.vaultPda !== vault) {
    throw new WalletSignatureError("Invalid wallet", 400);
  }

  const { value } = await getSolanaRpc()
    .getAccountInfo(pdas.authorityPda, { encoding: "base64" })
    .send();
  if (!value) {
    throw new WalletSignatureError("Unknown passkey", 401);
  }
  const raw = Array.isArray(value.data) ? value.data[0] : value.data;
  let authority;
  try {
    authority = decodeAuthorityAccount(
      new Uint8Array(getBase64Encoder().encode(raw)),
    );
  } catch {
    throw new WalletSignatureError("Unknown passkey", 401);
  }
  if (authority.wallet !== walletPda) {
    throw new WalletSignatureError("Invalid wallet", 400);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(new TextDecoder().decode(clientDataJSON));
  } catch {
    throw new WalletSignatureError("Invalid signature", 400);
  }
  if (field(parsedJson, "type") !== "webauthn.get") {
    throw new WalletSignatureError("Bad signature", 401);
  }
  const expectedChallenge = bytesToBase64Url(
    await sha256(new TextEncoder().encode(args.message)),
  );
  if (field(parsedJson, "challenge") !== expectedChallenge) {
    throw new WalletSignatureError("Bad signature", 401);
  }

  const message = concatBytes([
    authenticatorData,
    await sha256(clientDataJSON),
  ]);
  const ok = p256.verify(signature, message, authority.compressedPubkey);
  if (!ok) throw new WalletSignatureError("Bad signature", 401);
}
