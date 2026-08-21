import "server-only";

import { getAddressEncoder } from "@solana/kit";
import { ed25519 } from "@noble/curves/ed25519.js";

import { base64ToBytes } from "@/lib/crypto/base64";
import { tryParseAddress } from "@/lib/solana/address";

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

/** Verify an ed25519 signature over `message` from `wallet`. */
export function requireWalletSignature(args: {
  wallet: string;
  message: string;
  signatureB64: string;
}): void {
  const walletAddress = tryParseAddress(args.wallet);
  if (!walletAddress) {
    throw new WalletSignatureError("Invalid wallet", 400);
  }

  let signature: Uint8Array;
  try {
    signature = base64ToBytes(args.signatureB64);
  } catch {
    throw new WalletSignatureError("Invalid signature", 400);
  }
  if (signature.length !== 64) {
    throw new WalletSignatureError("Invalid signature", 400);
  }

  const pubkey = new Uint8Array(getAddressEncoder().encode(walletAddress));
  if (pubkey.length !== 32) {
    throw new WalletSignatureError("Invalid wallet", 400);
  }

  const ok = ed25519.verify(
    signature,
    new TextEncoder().encode(args.message),
    pubkey,
  );
  if (!ok) throw new WalletSignatureError("Bad signature", 401);
}
