import { p256 } from "@noble/curves/nist.js";
import type { Address } from "@solana/kit";
import { compressP256PublicKey, concatBytes, derEcdsaToRawLowS, sha256 } from "lazor-kit";

import { base64ToBytes, base64UrlToBytes, bytesToBase64Url } from "@/shared/base64";
import { resolveSmartWalletPdas } from "@/lazorkit/resolve-pdas";
import { getPasskeyMapping, putPasskeyMapping } from "./passkey-map";
import { timingSafeEqualBytes } from "@/platform/timing-safe";

export class WalletAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WalletAuthError";
  }
}

export type WalletAuthAssertionWire = {
  requestId?: string;
  credentialId?: string;
  compressedPubkey?: string;
  authenticatorData?: string;
  clientDataJSON?: string;
  signature?: string;
};

export type WalletRegistrationWire = {
  requestId?: string;
  credentialId?: string;
  compressedPubkey?: string;
  authenticatorData?: string;
  clientDataJSON?: string;
  rpId?: string;
};

export type ResolvedWalletSession = {
  vaultPda: Address;
  walletPda: Address;
  authorityPda: Address;
  compressedPubkey: Uint8Array;
};

function rawSignatureFromDer(signatureDer: Uint8Array): Uint8Array {
  try {
    return derEcdsaToRawLowS(signatureDer);
  } catch {
    throw new WalletAuthError("Invalid passkey proof");
  }
}

async function verifyWebAuthnAssertion(args: {
  challengeBase64Url: string;
  expectedOrigin?: string | null;
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  signatureDer: Uint8Array;
  compressedPubkey: Uint8Array;
}): Promise<void> {
  let clientData: { type?: string; challenge?: string; origin?: string };
  try {
    clientData = JSON.parse(new TextDecoder().decode(args.clientDataJSON)) as {
      type?: string;
      challenge?: string;
      origin?: string;
    };
  } catch {
    throw new WalletAuthError("Invalid passkey proof");
  }
  if (clientData.type !== "webauthn.get") {
    throw new WalletAuthError("Invalid passkey proof");
  }
  if (clientData.challenge !== args.challengeBase64Url) {
    throw new WalletAuthError("This expired. Try again.");
  }
  if (
    args.expectedOrigin &&
    clientData.origin &&
    clientData.origin !== args.expectedOrigin
  ) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  if (args.authenticatorData.length < 33 || (args.authenticatorData[32]! & 0x04) === 0) {
    throw new WalletAuthError("User verification required");
  }

  const clientDataHash = await sha256(args.clientDataJSON);
  const message = concatBytes([args.authenticatorData, clientDataHash]);
  const signature = rawSignatureFromDer(args.signatureDer);

  const ok = p256.verify(signature, message, args.compressedPubkey);
  if (!ok) throw new WalletAuthError("Invalid passkey proof");
}

export async function resolveWalletFromCredential(
  credentialId: Uint8Array,
  compressedPubkeyHint?: Uint8Array,
): Promise<ResolvedWalletSession> {
  const compressedPubkey =
    (await getPasskeyMapping(credentialId)) ?? compressedPubkeyHint;
  if (!compressedPubkey) {
    throw new WalletAuthError("Unknown passkey");
  }
  const pdas = await resolveSmartWalletPdas({ compressedPubkey, credentialId });
  return {
    vaultPda: pdas.vaultPda,
    walletPda: pdas.walletPda,
    authorityPda: pdas.authorityPda,
    compressedPubkey,
  };
}

function findCoseBytes(cose: Uint8Array, key: number): Uint8Array | null {
  for (let i = 0; i < cose.length - 3; i++) {
    if (cose[i] === key && (cose[i + 1]! & 0xe0) === 0x40) {
      const n = cose[i + 1]! & 0x1f;
      if (n === 24) {
        const len = cose[i + 2]!;
        if (i + 3 + len <= cose.length) return cose.slice(i + 3, i + 3 + len);
      } else if (n < 24) {
        if (i + 2 + n <= cose.length) return cose.slice(i + 2, i + 2 + n);
      }
    }
  }
  return null;
}

function compressedPubkeyFromAuthenticatorData(
  authenticatorData: Uint8Array,
): { credentialId: Uint8Array; compressedPubkey: Uint8Array } {
  if (authenticatorData.length < 37) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  const flags = authenticatorData[32]!;
  if ((flags & 0x04) === 0) {
    throw new WalletAuthError("Confirm with Face ID first.");
  }
  if ((flags & 0x40) === 0) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  let offset = 37 + 16;
  if (authenticatorData.length < offset + 2) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  const credIdLen =
    (authenticatorData[offset]! << 8) | authenticatorData[offset + 1]!;
  offset += 2;
  if (authenticatorData.length < offset + credIdLen) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  const credentialId = authenticatorData.slice(offset, offset + credIdLen);
  offset += credIdLen;
  const cose = authenticatorData.subarray(offset);
  const x = findCoseBytes(cose, 0x21);
  const y = findCoseBytes(cose, 0x22);
  if (!x || !y || x.length !== 32 || y.length !== 32) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  const uncompressed = new Uint8Array(65);
  uncompressed[0] = 0x04;
  uncompressed.set(x, 1);
  uncompressed.set(y, 33);
  return {
    credentialId,
    compressedPubkey: compressP256PublicKey(uncompressed),
  };
}

async function verifyWebAuthnRegistration(args: {
  challengeBase64Url: string;
  rpId: string;
  expectedOrigin?: string | null;
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  credentialId: Uint8Array;
  compressedPubkey: Uint8Array;
}): Promise<void> {
  let clientData: { type?: string; challenge?: string; origin?: string };
  try {
    clientData = JSON.parse(new TextDecoder().decode(args.clientDataJSON)) as {
      type?: string;
      challenge?: string;
      origin?: string;
    };
  } catch {
    throw new WalletAuthError("Invalid passkey proof");
  }
  if (clientData.type !== "webauthn.create") {
    throw new WalletAuthError("Invalid passkey proof");
  }
  if (clientData.challenge !== args.challengeBase64Url) {
    throw new WalletAuthError("This expired. Try again.");
  }
  if (
    args.expectedOrigin &&
    clientData.origin &&
    clientData.origin !== args.expectedOrigin
  ) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  if (args.authenticatorData.length < 33 || (args.authenticatorData[32]! & 0x04) === 0) {
    throw new WalletAuthError("User verification required");
  }

  const rpIdHash = await sha256(new TextEncoder().encode(args.rpId));
  if (
    args.authenticatorData.length < 32 ||
    !timingSafeEqualBytes(args.authenticatorData.slice(0, 32), rpIdHash)
  ) {
    throw new WalletAuthError("Invalid passkey proof");
  }

  const extracted = compressedPubkeyFromAuthenticatorData(args.authenticatorData);
  if (
    bytesToBase64Url(extracted.credentialId) !==
    bytesToBase64Url(args.credentialId)
  ) {
    throw new WalletAuthError("Invalid passkey proof");
  }
  if (
    bytesToBase64Url(extracted.compressedPubkey) !==
    bytesToBase64Url(args.compressedPubkey)
  ) {
    throw new WalletAuthError("Invalid passkey proof");
  }
}

export async function assertWalletRegistration(
  wire: WalletRegistrationWire,
  challengeBase64Url: string,
  expectedOrigin?: string | null,
): Promise<ResolvedWalletSession> {
  if (
    !wire.requestId ||
    !wire.credentialId ||
    !wire.compressedPubkey ||
    !wire.authenticatorData ||
    !wire.clientDataJSON ||
    !wire.rpId
  ) {
    throw new WalletAuthError("Missing passkey proof");
  }

  const credentialId = base64UrlToBytes(wire.credentialId);
  const compressedPubkey = base64UrlToBytes(wire.compressedPubkey);
  if (compressedPubkey.length !== 33) {
    throw new WalletAuthError("Invalid passkey proof");
  }

  await verifyWebAuthnRegistration({
    challengeBase64Url,
    rpId: wire.rpId,
    expectedOrigin,
    authenticatorData: base64ToBytes(wire.authenticatorData),
    clientDataJSON: base64ToBytes(wire.clientDataJSON),
    credentialId,
    compressedPubkey,
  });

  await putPasskeyMapping({ credentialId, compressedPubkey });
  const pdas = await resolveSmartWalletPdas({ compressedPubkey, credentialId });
  return {
    vaultPda: pdas.vaultPda,
    walletPda: pdas.walletPda,
    authorityPda: pdas.authorityPda,
    compressedPubkey,
  };
}

export async function assertWalletAuthAssertion(
  wire: WalletAuthAssertionWire,
  challengeBase64Url: string,
  expectedOrigin?: string | null,
): Promise<ResolvedWalletSession> {
  if (
    !wire.requestId ||
    !wire.credentialId ||
    !wire.authenticatorData ||
    !wire.clientDataJSON ||
    !wire.signature
  ) {
    throw new WalletAuthError("Missing passkey proof");
  }

  const credentialId = base64UrlToBytes(wire.credentialId);
  const compressedHint = wire.compressedPubkey
    ? base64UrlToBytes(wire.compressedPubkey)
    : undefined;
  const session = await resolveWalletFromCredential(
    credentialId,
    compressedHint?.length === 33 ? compressedHint : undefined,
  );
  await verifyWebAuthnAssertion({
    challengeBase64Url,
    expectedOrigin,
    authenticatorData: base64ToBytes(wire.authenticatorData),
    clientDataJSON: base64ToBytes(wire.clientDataJSON),
    signatureDer: base64ToBytes(wire.signature),
    compressedPubkey: session.compressedPubkey,
  });
  return session;
}

export function walletAuthErrorMessage(error: unknown): string {
  if (error instanceof WalletAuthError) return error.message;
  return "Couldn’t verify Face ID";
}
