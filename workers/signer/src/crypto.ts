import { ed25519 } from "@noble/curves/ed25519.js";

import { bytesToBase64Url, base64UrlToBytes } from "./base64";

const PREFIX = "enc:v1:";
const IV_BYTES = 12;

/**
 * AES-256-GCM for private keys at rest in signer D1.
 * Key material: `APP_ENCRYPTION_SECRET`, HKDF-derived for this purpose.
 * Do not change HKDF salt/info — that would invalidate existing ciphertext.
 */
const aesKeys = new Map<string, Promise<CryptoKey>>();

async function deriveAesKey(material: string): Promise<CryptoKey> {
  const ikm = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(material),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode("phygital-payments"),
      info: new TextEncoder().encode("agent-session-secret-v1"),
    },
    ikm,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function aesKey(material: string): Promise<CryptoKey> {
  let pending = aesKeys.get(material);
  if (!pending) {
    pending = deriveAesKey(material).catch((error: unknown) => {
      aesKeys.delete(material);
      throw error;
    });
    aesKeys.set(material, pending);
  }
  return pending;
}

export function newEd25519SecretBytes(): Uint8Array {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const pub = ed25519.getPublicKey(seed);
  const full = new Uint8Array(64);
  full.set(seed, 0);
  full.set(pub, 32);
  return full;
}

export async function sealSecret(
  encryptionSecret: string,
  plaintextBase64: string,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await aesKey(encryptionSecret);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintextBase64),
  );
  const cipher = new Uint8Array(cipherBuf);
  const packed = new Uint8Array(iv.length + cipher.length);
  packed.set(iv, 0);
  packed.set(cipher, iv.length);
  return `${PREFIX}${bytesToBase64Url(packed)}`;
}

export async function openSecret(
  encryptionSecret: string,
  ciphertext: string,
): Promise<string> {
  if (!ciphertext.startsWith(PREFIX)) {
    throw new Error("Secret is not encrypted");
  }
  const packed = base64UrlToBytes(ciphertext.slice(PREFIX.length));
  if (packed.length <= IV_BYTES) {
    throw new Error("Secret ciphertext is truncated");
  }
  const iv = packed.slice(0, IV_BYTES);
  const cipher = packed.slice(IV_BYTES);
  const key = await aesKey(encryptionSecret);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher,
  );
  return new TextDecoder().decode(plainBuf);
}
