import { sha256 } from "@/lib/lazorkit/bytes";
import { derEcdsaToRawLowS } from "@/lib/lazorkit/bytes";
import { getPasskeyAssertion } from "@/lib/lazorkit/passkey";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";
import { bytesToBase64 } from "@/lib/crypto/base64";

export type PasskeyMessageProof = {
  wallet: string;
  walletPda: string;
  credentialId: string;
  authenticatorData: string;
  clientDataJSON: string;
  signature: string;
};

export async function signSessionMessage(
  session: SmartWalletSession,
  message: string,
): Promise<PasskeyMessageProof> {
  const challenge = await sha256(new TextEncoder().encode(message));
  const assertion = await getPasskeyAssertion({
    challenge,
    credentialId: session.credentialId,
    rpId: session.rpId,
  });
  return {
    wallet: String(session.vaultPda),
    walletPda: String(session.walletPda),
    credentialId: bytesToBase64(assertion.credentialId),
    authenticatorData: bytesToBase64(assertion.authenticatorData),
    clientDataJSON: bytesToBase64(assertion.clientDataJSON),
    signature: bytesToBase64(derEcdsaToRawLowS(assertion.signatureDer)),
  };
}
