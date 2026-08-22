import "server-only";

import { p256 } from "@noble/curves/nist.js";
import type { Address } from "@solana/kit";
import { concatBytes, derEcdsaToRawLowS, sha256 } from "lazor-kit";

import { base64ToBytes, base64UrlToBytes } from "@/lib/crypto/base64";
import { resolveSmartWalletPdas } from "@/lib/lazorkit/resolve-pdas";
import { getPasskeyMapping } from "./passkey-map";

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
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  signatureDer: Uint8Array;
  compressedPubkey: Uint8Array;
}): Promise<void> {
  let clientData: { type?: string; challenge?: string };
  try {
    clientData = JSON.parse(new TextDecoder().decode(args.clientDataJSON)) as {
      type?: string;
      challenge?: string;
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

export async function assertWalletAuthAssertion(
  wire: WalletAuthAssertionWire,
  challengeBase64Url: string,
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
