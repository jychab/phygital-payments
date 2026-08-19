import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

import type {
  SubmitTransferRequest,
  TransferJob,
} from "@/lib/collect/settle-types";

/** RPC surface of TransferSubmitterDO — keep in sync with the worker. */
export type SubmitterStub = {
  enqueue(body: SubmitTransferRequest): Promise<{ jobId: string }>;
  enqueueAndWait(
    body: SubmitTransferRequest,
    timeoutMs?: number,
  ): Promise<TransferJob>;
  getJob(jobId: string): Promise<TransferJob | null>;
  waitForJob(jobId: string, timeoutMs?: number): Promise<TransferJob | null>;
};

export function getSubmitterStub(): SubmitterStub {
  const ns = getCloudflareContext().env.TRANSFER_SUBMITTER;
  if (!ns) {
    throw new Error(
      "TRANSFER_SUBMITTER Durable Object binding is not configured",
    );
  }
  return ns.get(ns.idFromName("global"));
}
