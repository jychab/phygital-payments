/**
 * Bind a verified WebAuthn passkey to an expected chip (URL path)
 * or accept it as discovery (cold `/`).
 */

export const PASSKEY_MISMATCH = "This is not the same phygital token.";
export const PASSKEY_NOT_VERIFIED = "Couldn't verify this phygital token.";

export function bindVerifiedPasskey(
  result: { isVerified: boolean; secp256r1PublicKey: string },
  expectedPublicKey?: string,
): string {
  if (!result.isVerified || !result.secp256r1PublicKey.trim()) {
    throw new Error(PASSKEY_NOT_VERIFIED);
  }
  const actual = result.secp256r1PublicKey.trim();
  if (expectedPublicKey && actual !== expectedPublicKey.trim()) {
    throw new Error(PASSKEY_MISMATCH);
  }
  return actual;
}
