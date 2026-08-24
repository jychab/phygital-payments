/** Versioned signer RPC — transport-agnostic (service binding or HTTP). */

export const SIGNER_API_VERSION = "v1" as const;

export type SignerChallengeStatus = {
  requestId: string;
  expiresAtMs: number;
  active: boolean;
};

export type SignerCreateChallengeResult = {
  requestId: string;
  challenge: string;
  expiresAtMs: number;
};

/** Internal: API needs the challenge string to verify WebAuthn before policy checks. */
export type SignerPeekChallengeResult = {
  requestId: string;
  challenge: string;
  expiresAtMs: number;
  consumed: boolean;
};

export type SignerCreateSessionKeyRequest = {
  phygitalPasskey: string;
  vaultPda: string;
  walletPda: string;
  expiresAtSlot: string;
};

export type SignerCreateSessionKeyResult = {
  sessionPublicKey: string;
  /** Base64url-encoded 32-byte ed25519 public key bytes for on-chain createSession. */
  sessionKey: string;
};

export type SignerDestroySessionKeyRequest = {
  phygitalPasskey: string;
};

export type SignerSignSessionRequest = {
  requestId: string;
  webauthnResponse: unknown;
  transaction: string;
  sessionPublicKey: string;
  feePayer: string;
};

export type SignerSignSessionResult = {
  transaction: string;
};

export type SignerSignFeePayerRequest = {
  transaction: string;
};

export type SignerSignFeePayerResult = {
  transaction: string;
};

export type SignerFeePayerPublicKeyResult = {
  publicKey: string;
};

export type SignerProvisionFeePayerKeyRequest = {
  /** Base58 or JSON byte array — sealed in signer D1, never stored in env. */
  secretKey: string;
};

export type SignerRpcErrorBody = {
  error: string;
  code?: string;
};

export type SignerRpcAction =
  | "createChallenge"
  | "getChallenge"
  | "peekChallenge"
  | "createSessionKey"
  | "destroySessionKey"
  | "provisionFeePayerKey"
  | "getFeePayerPublicKey"
  | "signSession"
  | "signFeePayer";

export function signerPath(action: SignerRpcAction): string {
  return `/${SIGNER_API_VERSION}/${action}`;
}
