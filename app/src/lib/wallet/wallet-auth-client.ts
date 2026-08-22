import { bytesToBase64, bytesToBase64Url, base64UrlToBytes } from "@/lib/crypto/base64";
import {
  getPasskeyAssertion,
  type PasskeyAssertion,
} from "@/lib/lazorkit/passkey";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";
import { queryFetch, readJson } from "@/lib/queries/http";

export type WalletAuthProof = {
  requestId: string;
  credentialId: string;
  compressedPubkey: string;
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
  compressedPubkey: Uint8Array,
): WalletAuthProof {
  return {
    requestId,
    credentialId: bytesToBase64Url(assertion.credentialId),
    compressedPubkey: bytesToBase64Url(compressedPubkey),
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
