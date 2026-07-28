/**
 * Ambient `Env` for the Durable Object / worker code in this folder.
 * Compiled only by `app/worker/tsconfig.json` (excluded from the Next build).
 * Keep in sync with the bindings/vars declared in `app/wrangler.jsonc`.
 */
interface Env {
  TRANSFER_SUBMITTER: DurableObjectNamespace;
  SOLANA_RPC_URL: string;
  /** Optional WebSocket RPC for signature subscriptions (else derived from RPC URL). */
  SOLANA_RPC_SUBSCRIPTIONS_URL?: string;
  FEE_PAYER_SECRET_KEY: string;
  FEE_PAYER_PUBLIC_KEY: string;
  PRIVY_APP_ID: string;
  /** PEM SPKI verification key from Privy Dashboard (ES256). */
  PRIVY_VERIFICATION_KEY: string;
}
