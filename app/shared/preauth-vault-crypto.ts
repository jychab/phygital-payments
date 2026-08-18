/**
 * Shared PRF vault crypto — must stay byte-identical on client (seal) and server (in-app grant).
 */

import { base64ToBytes, bytesToBase64 } from "./base64";

export const PREAUTH_GCM_IV_BYTES = 12;

const HKDF_INFO = new TextEncoder().encode("phygital-pay/preauth-api-key/v2");

function walletAad(wallet: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(wallet) as Uint8Array<ArrayBuffer>;
}

async function deriveAesKey(prfOutput: ArrayBuffer): Promise<CryptoKey> {
  const ikm = await crypto.subtle.importKey(
    "raw",
    prfOutput,
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(),
      info: HKDF_INFO,
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/** Decrypt a Face ID–sealed pay key (client seal or server in-app grant). */
export async function decryptPreauthVault(args: {
  encryptedB64: string;
  prfOutput: ArrayBuffer;
  wallet: string;
}): Promise<string> {
  const aesKey = await deriveAesKey(args.prfOutput);
  const combined = base64ToBytes(args.encryptedB64);
  if (combined.length <= PREAUTH_GCM_IV_BYTES) {
    throw new Error("Pay vault data is corrupted.");
  }
  const iv = combined.slice(0, PREAUTH_GCM_IV_BYTES) as Uint8Array<ArrayBuffer>;
  const data = combined.slice(PREAUTH_GCM_IV_BYTES);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: walletAad(args.wallet) },
    aesKey,
    data,
  );
  return new TextDecoder().decode(plaintext);
}

/** Encrypt a pay key for localStorage (client-only). */
export async function encryptPreauthVault(args: {
  apiKey: string;
  prfOutput: ArrayBuffer;
  wallet: string;
}): Promise<string> {
  const aesKey = await deriveAesKey(args.prfOutput);
  const iv = crypto.getRandomValues(new Uint8Array(PREAUTH_GCM_IV_BYTES));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: walletAad(args.wallet) },
    aesKey,
    new TextEncoder().encode(args.apiKey.trim()),
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return bytesToBase64(combined);
}

export function prfOutputToBase64(prfOutput: ArrayBuffer): string {
  return bytesToBase64(new Uint8Array(prfOutput));
}

export function prfOutputFromBase64(encoded: string): ArrayBuffer {
  const bytes = base64ToBytes(encoded);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}
