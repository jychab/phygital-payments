import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type {
  SubmitTransferRequest,
  TransferJob,
} from "@/lib/payments/submitter-types";

export { requirePrivySession, AuthError } from "../../../worker/auth";
export type { PrivySession } from "../../../worker/auth";

/**
 * RPC surface of the TransferSubmitterDO, declared locally so server routes
 * never import `cloudflare:workers` (that lives only in `app/worker/`).
 * Keep in sync with `app/worker/transfer-submitter.ts`.
 */
export type SubmitterStub = {
  enqueue(
    body: SubmitTransferRequest,
    userId: string,
  ): Promise<{ jobId: string }>;
  getJob(jobId: string): Promise<TransferJob | null>;
  /** Long-poll: resolves when the job reaches a terminal status or on timeout. */
  waitForJob(jobId: string, timeoutMs?: number): Promise<TransferJob | null>;
};

/** Minimal DO namespace surface we use (avoids depending on workers-types). */
type SubmitterNamespace = {
  idFromName(name: string): unknown;
  get(id: unknown): SubmitterStub;
};

/**
 * Cloudflare env fields the server routes/DO rely on. The public bindings are
 * in `app/wrangler.jsonc`; secrets (FEE_PAYER_SECRET_KEY, PRIVY_VERIFICATION_KEY)
 * come from `.dev.vars` locally / `wrangler secret` in prod. The generated
 * `cloudflare-env.d.ts` is excluded from the Next TS program (it re-exports the
 * DO class, which would drag `cloudflare:workers` into the browser build), so we
 * type the env we need here and cast.
 */
export type WorkerEnv = {
  TRANSFER_SUBMITTER: SubmitterNamespace;
  PRIVY_APP_ID: string;
  PRIVY_VERIFICATION_KEY: string;
  SOLANA_RPC_URL: string;
  FEE_PAYER_PUBLIC_KEY: string;
  FEE_PAYER_SECRET_KEY: string;
};

/** Cloudflare env available to server code (routes, RSC). */
export function getWorkerEnv(): WorkerEnv {
  return getCloudflareContext().env as unknown as WorkerEnv;
}

/** Resolve the single global TransferSubmitterDO stub. */
export function getSubmitterStub(): SubmitterStub {
  const ns = getWorkerEnv().TRANSFER_SUBMITTER;
  if (!ns) {
    throw new Error(
      "TRANSFER_SUBMITTER Durable Object binding is not configured",
    );
  }
  return ns.get(ns.idFromName("global"));
}
