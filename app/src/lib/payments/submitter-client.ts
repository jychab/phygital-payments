import type {
  JobStatusResponse,
  SubmitTransferRequest,
  SubmitTransferResponse,
  TransferJob,
} from "./submitter-types";

/** Same-origin proxy path to the sponsored-transfer submitter. */
const SUBMITTER_BASE = "/api/transfer-submitter";

async function submitterFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${SUBMITTER_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
    },
  });
}

/**
 * Pre-warm the submitter DO (fee-payer signer + blockhash) so the actual submit
 * hits a hot object. Fire-and-forget; failures are swallowed.
 */
export async function warmSubmitter(): Promise<void> {
  try {
    await submitterFetch("/warm", { method: "POST" });
  } catch {
    // Warm-up is best-effort — a cold submit still works, just slower.
  }
}

export async function postSponsoredTransfer(
  body: SubmitTransferRequest,
): Promise<SubmitTransferResponse> {
  const res = await submitterFetch("/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as SubmitTransferResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Submit failed (${res.status})`);
  }
  return data;
}

export async function getTransferJob(
  jobId: string,
  opts?: { wait?: boolean },
): Promise<TransferJob> {
  const query = opts?.wait ? "?wait=1" : "";
  const res = await submitterFetch(`/jobs/${encodeURIComponent(jobId)}${query}`);
  const data = (await res.json()) as JobStatusResponse & { error?: string };
  if (!res.ok) {
    throw new Error(data.error ?? `Job lookup failed (${res.status})`);
  }
  return data.job;
}

/**
 * Wait for a terminal job status. Uses server long-poll (`?wait=1`): the DO
 * holds each request open until the job confirms/fails or its hold times out,
 * so there is no fixed client poll interval adding latency.
 */
export async function pollTransferJob(
  jobId: string,
  opts?: { timeoutMs?: number },
): Promise<TransferJob> {
  const deadline = Date.now() + (opts?.timeoutMs ?? 90_000);

  while (Date.now() < deadline) {
    const job = await getTransferJob(jobId, { wait: true });
    if (job.status === "confirmed" || job.status === "failed") {
      return job;
    }
    // Long-poll returned on hold-timeout without a terminal status — re-issue.
  }
  throw new Error("Timed out waiting for sponsored transfer");
}
