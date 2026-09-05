/**
 * Pluggable verifier signing backends.
 *
 * v1: SecretsVerifierBackend (Worker secret map)
 * later: KmsVerifierBackend (non-exportable cloud KMS) — same interface
 */
export type VerifierSignerBackend = {
  /** True if this Worker can co-sign for the on-chain execute.verifier pubkey. */
  canSign(verifierPubkey: string): boolean | Promise<boolean>;
  /** Sign Solana tx message bytes; returns 64-byte signature as base64. */
  sign(verifierPubkey: string, messageBytes: Uint8Array): Promise<string>;
};

export const MAX_VERIFIER_KEYS = 8;
