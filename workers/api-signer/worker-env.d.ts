/* eslint-disable */
/**
 * Signer Worker env. Regenerate with `pnpm --filter api-signer cf-typegen` when
 * bindings change; keep hand-edited secrets / backend vars in sync.
 */
interface Env {
  phygital_token: D1Database;
  SOLANA_CLUSTER: string;
  SOLANA_RPC_URL: string;
  TOP_UP_ACCUMULATOR?: string;
  /**
   * `secrets` (default) | `kms` (reserved — not implemented yet).
   * Select via factory in `src/backend/create.ts`.
   */
  VERIFIER_SIGNER_BACKEND?: string;
  /**
   * JSON map of base58 verifier pubkey → base58 seed or 64-byte keypair.
   * Max 8 entries (on-chain Config MAX_VERIFIERS).
   */
  VERIFIER_SECRET_KEYS?: string;
  /**
   * Reserved for KmsVerifierBackend: JSON map pubkey → KMS key id / ARN.
   * Unused while VERIFIER_SIGNER_BACKEND=secrets.
   */
  VERIFIER_KMS_KEY_MAP?: string;
}
