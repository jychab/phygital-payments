interface CloudflareEnv {
  phygital_app: D1Database;
  revibase_counter: KVNamespace;
  SIGNER?: Fetcher;
  ANALYTICS?: AnalyticsEngineDataset;
  PUBLIC_READ_LIMITER?: RateLimit;
  PUBLIC_WRITE_LIMITER?: RateLimit;
  SPONSOR_LIMITER?: RateLimit;
  NEXT_PUBLIC_SOLANA_RPC_URL: string;
  NEXT_PUBLIC_SOLANA_CLUSTER: "devnet" | "mainnet";
  /** Comma-separated browser origins allowed for credentialed CORS. */
  APP_ORIGIN?: string;
  WALLET_SESSION_SECRET?: string;
  SIGNER_INTERNAL_TOKEN?: string;
  /** Dev-only HTTP signer when the SIGNER service binding is unavailable. */
  SIGNER_ORIGIN?: string;
}
