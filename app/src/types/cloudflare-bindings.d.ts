// Ambient augmentation of @opennextjs/cloudflare's global `CloudflareEnv` with
// the bindings our server code reads via getCloudflareContext().env.
//
// The generated `cloudflare-env.d.ts` already declares these, but it is excluded
// from this TS project because it imports `./custom-worker` (pulling the Durable
// Object + `cloudflare:workers` runtime types into the Next build). This file is
// the minimal, browser-safe replacement — keep it in sync with `wrangler.jsonc`.
//
// No imports/exports here on purpose: that keeps it a global script file so the
// `interface CloudflareEnv` below merges with the package's global one.

interface AppD1Result<T = unknown> {
  results: T[];
}
interface AppD1PreparedStatement {
  bind(...values: unknown[]): AppD1PreparedStatement;
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<AppD1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
}
interface AppD1Database {
  prepare(query: string): AppD1PreparedStatement;
  batch(statements: AppD1PreparedStatement[]): Promise<unknown[]>;
  exec(query: string): Promise<unknown>;
}

/** Loose DO namespace shape (avoids importing `cloudflare:workers` types). */
interface AppDurableObjectNamespace {
  idFromName(name: string): unknown;
  get(id: unknown): unknown;
}

interface CloudflareEnv {
  // D1 — binding name from wrangler.jsonc `d1_databases[].binding`.
  phygital_payments: AppD1Database;
  // Durable Object.
  TRANSFER_SUBMITTER: AppDurableObjectNamespace;
  // Secrets / vars (from .dev.vars locally, `wrangler secret`/vars in prod).
  SOLANA_RPC_URL: string;
  SOLANA_RPC_SUBSCRIPTIONS_URL?: string;
  FEE_PAYER_SECRET_KEY: string;
  FEE_PAYER_PUBLIC_KEY: string;
  PRIVY_APP_ID: string;
  PRIVY_VERIFICATION_KEY: string;
  HELIUS_WEBHOOK_AUTH: string;
}
