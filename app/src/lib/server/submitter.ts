import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type {
  SubmitTransferRequest,
  TransferJob,
} from "@/lib/payments/submitter-types";

/**
 * RPC surface of the TransferSubmitterDO, declared locally so server routes
 * never import `cloudflare:workers` (that lives only in `app/worker/`).
 * Keep in sync with `app/worker/transfer-submitter.ts`.
 */
export type SubmitterStub = {
  enqueue(body: SubmitTransferRequest): Promise<{ jobId: string }>;
  /** Enqueue then long-poll until terminal (or hold timeout). */
  enqueueAndWait(
    body: SubmitTransferRequest,
    timeoutMs?: number,
  ): Promise<TransferJob>;
  getJob(jobId: string): Promise<TransferJob | null>;
  /** Long-poll: resolves when the job reaches a terminal status or on timeout. */
  waitForJob(jobId: string, timeoutMs?: number): Promise<TransferJob | null>;
};

/** Resolve the single global TransferSubmitterDO stub. */
export function getSubmitterStub(): SubmitterStub {
  const ns = getCloudflareContext().env.TRANSFER_SUBMITTER;
  if (!ns) {
    throw new Error(
      "TRANSFER_SUBMITTER Durable Object binding is not configured",
    );
  }
  return ns.get(ns.idFromName("global"));
}
