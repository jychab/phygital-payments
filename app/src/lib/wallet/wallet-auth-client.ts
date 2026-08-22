import {
  bytesToBase64,
  bytesToBase64Url,
  base64UrlToBytes,
} from "@/lib/crypto/base64";
import {
  getPasskeyAssertion,
  type CreatedPasskey,
  type PasskeyAssertion,
} from "@/lib/lazorkit/passkey";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";
import { queryFetch, readJson } from "@/lib/queries/http";

export type WalletRegistrationProof = {
  requestId: string;
  credentialId: string;
  compressedPubkey: string;
  authenticatorData: string;
  clientDataJSON: string;
  rpId: string;
};

export function walletRegistrationProofFromPasskey(
  requestId: string,
  passkey: CreatedPasskey,
): WalletRegistrationProof {
  return {
    requestId,
    credentialId: bytesToBase64Url(passkey.credentialId),
    compressedPubkey: bytesToBase64Url(passkey.compressedPubkey),
    authenticatorData: bytesToBase64(passkey.authenticatorData),
    clientDataJSON: bytesToBase64(passkey.clientDataJSON),
    rpId: passkey.rpId,
  };
}

export type WalletAuthProof = {
  requestId: string;
  credentialId: string;
  compressedPubkey?: string;
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
};

export async function fetchWalletAuthChallenge(): Promise<{
  requestId: string;
  challenge: string;
}> {
  const challengeRes = await queryFetch("/api/wallet/auth/challenge", {
    method: "POST",
  });
  return readJson(challengeRes, "Couldn’t start Face ID");
}

export function walletAuthProofFromAssertion(
  requestId: string,
  assertion: PasskeyAssertion,
  compressedPubkey?: Uint8Array,
): WalletAuthProof {
  return {
    requestId,
    credentialId: bytesToBase64Url(assertion.credentialId),
    ...(compressedPubkey
      ? { compressedPubkey: bytesToBase64Url(compressedPubkey) }
      : {}),
    authenticatorData: bytesToBase64(assertion.authenticatorData),
    clientDataJSON: bytesToBase64(assertion.clientDataJSON),
    signature: bytesToBase64(assertion.signatureDer),
  };
}

/** Face ID proof that the caller owns this smart wallet session. */
export async function fetchWalletAuthProof(
  session: SmartWalletSession,
): Promise<WalletAuthProof> {
  const { requestId, challenge } = await fetchWalletAuthChallenge();
  const assertion = await getPasskeyAssertion({
    challenge: base64UrlToBytes(challenge),
    credentialId: session.credentialId,
    rpId: session.rpId,
  });
  return walletAuthProofFromAssertion(
    requestId,
    assertion,
    session.compressedPubkey,
  );
}

export type DiscoverableWalletAuth = {
  proof: WalletAuthProof;
  credentialId: Uint8Array;
};

/**
 * Discoverable Face ID sign-in (no local credential hint).
 * Empty allowCredentials lets the platform pick an existing passkey.
 */
export async function fetchDiscoverableWalletAuthProof(): Promise<DiscoverableWalletAuth> {
  const { requestId, challenge } = await fetchWalletAuthChallenge();
  const assertion = await getPasskeyAssertion({
    challenge: base64UrlToBytes(challenge),
  });
  return {
    proof: walletAuthProofFromAssertion(requestId, assertion),
    credentialId: assertion.credentialId,
  };
}
