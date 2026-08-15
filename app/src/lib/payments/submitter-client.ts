import type {
  JobStatusResponse,
  SubmitTransferRequest,
  TransferJob,
} from "./submitter-types";

/** Same-origin proxy path to the sponsored-transfer submitter. */
const SUBMITTER_BASE = "/api/transfer-submitter";

/** How many times to retry across network blips / 5xx (idempotent on the DO). */
const SUBMIT_NETWORK_RETRIES = 4;
const SUBMIT_RETRY_BASE_MS = 180;

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
 * Idempotency key for one WebAuthn assertion — stable across blip retries,
 * unique per tap (secp signature).
 */
async function idempotencyKeyForTransfer(
  body: SubmitTransferRequest,
): Promise<string> {
  if (body.idempotencyKey?.trim()) return body.idempotencyKey.trim();
  const data = new TextEncoder().encode(body.secpEntry.signature);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Card-rail submit: one browser RTT with idempotency + blip retries.
 *
 * Terminals don't fail the first dropped packet — they resume the same auth.
 * One WebAuthn assertion → one DO job; transient network / 5xx retry without
 * double-claiming the preauth grant.
 */
export async function submitAndWaitSponsoredTransfer(
  body: SubmitTransferRequest,
): Promise<{ signature: string; job: TransferJob }> {
  const payload = await withIdempotencyKey(body);

  let lastError: unknown;
  for (let attempt = 0; attempt < SUBMIT_NETWORK_RETRIES; attempt++) {
    try {
      return await submitAndWaitOnce(payload);
    } catch (error) {
      lastError = error;
      if (!isRetryableSubmitError(error) || attempt === SUBMIT_NETWORK_RETRIES - 1) {
        throw error instanceof Error ? error : new Error(String(error));
      }
      await sleep(SUBMIT_RETRY_BASE_MS * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Submit failed");
}

async function withIdempotencyKey(
  body: SubmitTransferRequest,
): Promise<SubmitTransferRequest> {
  const idempotencyKey = await idempotencyKeyForTransfer(body);
  return { ...body, idempotencyKey };
}

async function submitAndWaitOnce(
  body: SubmitTransferRequest,
): Promise<{ signature: string; job: TransferJob }> {
  const res = await submitterFetch("/transfer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data: {
    jobId?: string;
    job?: TransferJob;
    signature?: string;
    error?: string;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    const err = new Error(`Submit failed (${res.status})`);
    (err as Error & { status?: number }).status = res.status || 502;
    throw err;
  }

  if (data.job?.status === "confirmed" && (data.signature || data.job.signature)) {
    const signature = data.signature ?? data.job.signature;
    if (!signature) {
      throw new Error("Sponsored transfer confirmed without signature");
    }
    return {
      signature,
      job: data.job,
    };
  }

  // Hold timed out / still in flight — resume on the job id (blip-safe).
  if (data.jobId) {
    const job = await pollTransferJob(data.jobId);
    return terminalJobResult(job);
  }

  if (data.job?.status === "failed") {
    throw new Error(data.error ?? data.job.error ?? "Sponsored transfer failed");
  }

  if (!res.ok) {
    const err = new Error(data.error ?? `Submit failed (${res.status})`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  throw new Error(data.error ?? "Sponsored transfer did not confirm");
}

function terminalJobResult(job: TransferJob): { signature: string; job: TransferJob } {
  if (job.status === "failed") {
    throw new Error(job.error ?? "Sponsored transfer failed");
  }
  if (!job.signature) {
    throw new Error("Sponsored transfer confirmed without signature");
  }
  return { signature: job.signature, job };
}

async function getTransferJob(jobId: string): Promise<TransferJob> {
  const res = await submitterFetch(`/jobs/${encodeURIComponent(jobId)}`);
  const data = (await res.json()) as JobStatusResponse & { error?: string };
  if (!res.ok) {
    const err = new Error(data.error ?? `Job lookup failed (${res.status})`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  return data.job;
}

/**
 * Wait for a terminal job status via server long-poll.
 * Retries the long-poll on network blips without re-creating the job.
 */
async function pollTransferJob(
  jobId: string,
  opts?: { timeoutMs?: number },
): Promise<TransferJob> {
  const deadline = Date.now() + (opts?.timeoutMs ?? 90_000);
  let blipAttempt = 0;

  while (Date.now() < deadline) {
    try {
      const job = await getTransferJob(jobId);
      blipAttempt = 0;
      if (isTerminal(job.status)) {
        return job;
      }
      // Hold timed out without terminal status — re-issue.
    } catch (error) {
      if (!isRetryableSubmitError(error) || Date.now() >= deadline) {
        throw error instanceof Error ? error : new Error(String(error));
      }
      await sleep(SUBMIT_RETRY_BASE_MS * 2 ** Math.min(blipAttempt, 3));
      blipAttempt += 1;
    }
  }
  throw new Error("Timed out waiting for sponsored transfer");
}

function isTerminal(status: TransferJob["status"]): boolean {
  return status === "confirmed" || status === "failed";
}

/** Network / gateway failures — safe to retry because enqueue is idempotent. */
function isRetryableSubmitError(error: unknown): boolean {
  if (!(error instanceof Error)) return true;
  const status = (error as Error & { status?: number }).status;
  if (status != null) {
    if (status === 408 || status === 425 || status === 429) return true;
    if (status >= 500 && status <= 599) return true;
    if (status >= 400 && status < 500) return false;
  }
  const msg = error.message.toLowerCase();
  if (
    msg.includes("preauth") ||
    msg.includes("grant") ||
    msg.includes("stale") ||
    msg.includes("invalid payload") ||
    msg.includes("external verifier")
  ) {
    return false;
  }
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("aborted") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504") ||
    msg.includes("submit failed (5")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
