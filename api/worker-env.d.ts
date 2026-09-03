/** Cloudflare Worker bindings for revibase-api. */

interface Env {
  revibase_counter: KVNamespace;
  phygital_token: D1Database;
  SOLANA_CLUSTER: string;
  SOLANA_RPC_URL: string;
  JUPITER_API_KEY?: string;
  USDC_MINT?: string;
  /** Base58 (or JSON byte array) ed25519 secret — pubkey must match execute ix verifier. */
  VERIFIER_SECRET_KEY?: string;
  /** HMAC secret for HttpOnly phygital session cookies. */
  POLICY_SESSION_SECRET?: string;
}
