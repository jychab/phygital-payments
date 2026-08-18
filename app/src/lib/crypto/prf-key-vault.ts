/**
 * Face ID (platform passkey) + WebAuthn PRF vault for the payment API key.
 * All vault material lives in localStorage; in-app Pay sends ciphertext + PRF output
 * to the server for decryption (plaintext key stays out of JS memory on Pay/Cancel).
 */

import { base64ToBytes, bytesToBase64 } from "@/lib/crypto/base64";
import {
  decryptPreauthVault,
  encryptPreauthVault,
  prfOutputFromBase64,
  prfOutputToBase64,
} from "../../../shared/preauth-vault-crypto";

const STORAGE = {
  encrypted: "phygital.preauth.encrypted",
  wallet: "phygital.preauth.wallet",
  credentialId: "phygital.preauth.credentialId",
  prfSalt: "phygital.preauth.prfSalt",
} as const;

type PrfExtensionResults = {
  enabled?: boolean;
  results?: { first?: ArrayBuffer };
};

type VaultMaterial = {
  wallet: string;
  encrypted: string;
  credentialId: ArrayBuffer;
  saltB64: string;
};

export type PreauthVaultUnlockPayload = {
  wallet: string;
  encrypted: string;
  prfOutput: string;
};

function getRpId(): string {
  if (typeof window === "undefined") return "";
  return window.location.hostname;
}

function walletUserId(wallet: string): BufferSource {
  const bytes = new TextEncoder().encode(wallet);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function prfEvalSalt(salt: Uint8Array): BufferSource {
  if (salt.byteOffset === 0 && salt.byteLength === salt.buffer.byteLength) {
    return salt.buffer as ArrayBuffer;
  }
  return salt.slice();
}

function readPrfResults(credential: PublicKeyCredential): ArrayBuffer {
  const prf = credential.getClientExtensionResults()
    .prf as PrfExtensionResults | undefined;
  const output = prf?.results?.first;
  if (!output || output.byteLength < 32) {
    throw new Error(
      "Pay requires Face ID. Open this page in Safari on your iPhone.",
    );
  }
  return output;
}

async function evalPrfWithGet(args: {
  credentialId: ArrayBuffer;
  salt: Uint8Array;
  rpId: string;
}): Promise<ArrayBuffer> {
  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId: args.rpId,
      allowCredentials: [
        { id: args.credentialId, type: "public-key" as const },
      ],
      userVerification: "required",
      extensions: {
        prf: { eval: { first: prfEvalSalt(args.salt) } },
      },
    },
  })) as PublicKeyCredential | null;

  if (!assertion) {
    throw new Error("Face ID didn't match. Try again.");
  }
  return readPrfResults(assertion);
}

async function createPlatformPasskey(args: {
  wallet: string;
  salt: Uint8Array;
  rpId: string;
}): Promise<{ credentialId: ArrayBuffer; prfOutput: ArrayBuffer }> {
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Phygital Pay", id: args.rpId },
      user: {
        id: walletUserId(args.wallet),
        name: args.wallet.slice(0, 8) + "…",
        displayName: "Pay",
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" as const }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "required",
        userVerification: "required",
      },
      extensions: {
        prf: { eval: { first: prfEvalSalt(args.salt) } },
      },
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error("Pay requires Face ID. Try again.");
  }

  const prf = credential.getClientExtensionResults()
    .prf as PrfExtensionResults | undefined;
  if (!prf?.results?.first) {
    throw new Error(
      "Pay requires Face ID. Open this page in Safari on your iPhone.",
    );
  }

  return {
    credentialId: credential.rawId,
    prfOutput: readPrfResults(credential),
  };
}

function persistVault(material: VaultMaterial): void {
  localStorage.setItem(STORAGE.encrypted, material.encrypted);
  localStorage.setItem(STORAGE.wallet, material.wallet);
  localStorage.setItem(
    STORAGE.credentialId,
    bytesToBase64(new Uint8Array(material.credentialId)),
  );
  localStorage.setItem(STORAGE.prfSalt, material.saltB64);
}

function loadVault(wallet: string): VaultMaterial {
  const storedWallet = localStorage.getItem(STORAGE.wallet);
  if (storedWallet !== wallet) {
    throw new Error("Pay isn't set up on this phone yet.");
  }

  const encrypted = localStorage.getItem(STORAGE.encrypted);
  const credIdB64 = localStorage.getItem(STORAGE.credentialId);
  const saltB64 = localStorage.getItem(STORAGE.prfSalt);
  if (!encrypted || !credIdB64 || !saltB64) {
    throw new Error("Pay isn't set up on this phone yet.");
  }

  return {
    wallet,
    encrypted,
    credentialId: base64ToBytes(credIdB64).buffer as ArrayBuffer,
    saltB64,
  };
}

/** Sync check: encrypted blob exists for `wallet` (no Face ID). */
export function hasEncryptedPreauthApiKey(wallet?: string): boolean {
  if (typeof window === "undefined") return false;
  const encrypted = localStorage.getItem(STORAGE.encrypted);
  const credId = localStorage.getItem(STORAGE.credentialId);
  if (!encrypted || !credId) return false;
  const storedWallet = localStorage.getItem(STORAGE.wallet);
  if (wallet && storedWallet !== wallet) return false;
  return true;
}

/** Create or reuse platform passkey and encrypt `apiKey` in localStorage. */
export async function sealPreauthApiKey(
  wallet: string,
  apiKey: string,
): Promise<void> {
  const rpId = getRpId();
  const existingCred = localStorage.getItem(STORAGE.credentialId);
  const existingWallet = localStorage.getItem(STORAGE.wallet);
  const existingSalt = localStorage.getItem(STORAGE.prfSalt);

  let prfOutput: ArrayBuffer;
  let credentialId: ArrayBuffer;
  let saltB64: string;

  if (existingCred && existingWallet === wallet && existingSalt) {
    const salt = base64ToBytes(existingSalt);
    credentialId = base64ToBytes(existingCred).buffer as ArrayBuffer;
    saltB64 = existingSalt;
    prfOutput = await evalPrfWithGet({ credentialId, salt, rpId });
  } else {
    const salt = crypto.getRandomValues(new Uint8Array(32));
    saltB64 = bytesToBase64(salt);
    const created = await createPlatformPasskey({ wallet, salt, rpId });
    credentialId = created.credentialId;
    prfOutput = created.prfOutput;
  }

  const encrypted = await encryptPreauthVault({
    apiKey,
    prfOutput,
    wallet,
  });
  persistVault({ wallet, encrypted, credentialId, saltB64 });
}

/**
 * Face ID → PRF output + local ciphertext for server-side decrypt (in-app Pay/Cancel).
 * Plaintext api key is never returned.
 */
export async function collectPreauthVaultUnlock(
  wallet: string,
): Promise<PreauthVaultUnlockPayload> {
  const material = loadVault(wallet);
  const rpId = getRpId();
  const salt = base64ToBytes(material.saltB64);
  const prfOutput = await evalPrfWithGet({
    credentialId: material.credentialId,
    salt,
    rpId,
  });
  return {
    wallet,
    encrypted: material.encrypted,
    prfOutput: prfOutputToBase64(prfOutput),
  };
}

/**
 * Face ID unlock → plaintext key (Shortcuts open URL only).
 */
export async function unlockPreauthApiKey(wallet: string): Promise<string> {
  const payload = await collectPreauthVaultUnlock(wallet);
  return decryptPreauthVault({
    encryptedB64: payload.encrypted,
    prfOutput: prfOutputFromBase64(payload.prfOutput),
    wallet: payload.wallet,
  });
}
