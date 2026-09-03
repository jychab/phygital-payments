import { ed25519 } from "@noble/curves/ed25519.js";
import { getBase58Decoder, getBase58Encoder } from "@solana/kit";

import { getEnv } from "@/shared/request-context";
import { bytesToBase64 } from "@/shared/crypto/base64";

const base58Encoder = getBase58Encoder();
const base58Decoder = getBase58Decoder();

function getVerifierKeypair(): {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
  publicKeyBase58: string;
} {
  const raw = getEnv().VERIFIER_SECRET_KEY?.trim();
  if (!raw) {
    throw Object.assign(new Error("Verifier signing key is not configured"), {
      code: "signer_misconfigured",
    });
  }

  let secretKey: Uint8Array;
  if (raw.startsWith("[")) {
    secretKey = Uint8Array.from(JSON.parse(raw) as number[]);
  } else {
    secretKey = new Uint8Array(base58Encoder.encode(raw));
  }

  // 64-byte solana keypair (seed||pubkey) or 32-byte seed
  const seed = secretKey.length >= 64 ? secretKey.slice(0, 32) : secretKey;
  if (seed.length !== 32) {
    throw Object.assign(
      new Error("VERIFIER_SECRET_KEY must be 32 or 64 bytes"),
      { code: "signer_misconfigured" },
    );
  }
  const publicKey = ed25519.getPublicKey(seed);
  return {
    secretKey: seed,
    publicKey,
    publicKeyBase58: base58Decoder.decode(publicKey),
  };
}

/** Sign Solana transaction message bytes; returns 64-byte signature as base64. */
export function signMessageBase64(messageBytes: Uint8Array): string {
  const { secretKey } = getVerifierKeypair();
  const sig = ed25519.sign(messageBytes, secretKey);
  return bytesToBase64(sig);
}

/**
 * Ensure the execute ix verifier account is this worker's key.
 * Prevents co-signing txs addressed to a different verifier.
 */
export function assertExecuteVerifierMatchesKey(verifierFromTx: string): void {
  const { publicKeyBase58 } = getVerifierKeypair();
  if (verifierFromTx !== publicKeyBase58) {
    throw Object.assign(
      new Error("Transaction verifier does not match this signing service"),
      {
        code: "verifier_mismatch",
        details: { expected: publicKeyBase58, got: verifierFromTx },
      },
    );
  }
}
