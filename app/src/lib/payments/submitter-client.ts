import type {
  SubmitTransferRequest,
  TransferJob,
} from "./submitter-types";
import type {
  ClaimJob,
  SubmitClaimRequest,
} from "../../../shared/claim-wire";
import type { authenticatePasskeyForTransfer } from "phygital-token-sdk";

const SUBMITTER_BASE = "/api/transfer-submitter";
const SUBMIT_NETWORK_RETRIES = 4;
const SUBMIT_RETRY_BASE_MS = 180;

type SponsoredJob = {
  id: string;
  status: string;
  signature?: string;
  error?: string;
};

/** Card-rail transfer submit: one RTT with idempotency + blip retries. */
export async function submitAndWaitSponsoredTransfer(
  body: SubmitTransferRequest,
): Promise<{ signature: string; job: TransferJob }> {
  const idempotencyKey =
    body.idempotencyKey?.trim() ||
    (await sha256Hex(body.secpEntry.signature));
  return submitSponsoredJob({
    submitUrl: `${SUBMITTER_BASE}/transfer`,
    jobUrl: (id) => `${SUBMITTER_BASE}/jobs/${encodeURIComponent(id)}`,
    body: { ...body, idempotencyKey },
    label: "Sponsored transfer",
  }) as Promise<{ signature: string; job: TransferJob }>;
}

type ClaimAuthResponse = Awaited<
  ReturnType<typeof authenticatePasskeyForTransfer>
>;

/** Sponsored ownership claim (same DO / retry shape as transfers). */
export async function submitSponsoredClaim(params: {
  asset: string;
  slotNumber: string | bigint;
  auth: ClaimAuthResponse;
  recipient: string;
}): Promise<{ signature: string; job: ClaimJob }> {
  const body: SubmitClaimRequest = {
    asset: params.asset,
    slotNumber: String(params.slotNumber),
    recipient: params.recipient,
    auth: params.auth as SubmitClaimRequest["auth"],
    createdAtMs: Date.now(),
    idempotencyKey: await sha256Hex(params.auth.response.signature),
  };
  return submitSponsoredJob({
    submitUrl: "/api/claim",
    jobUrl: (id) => `/api/claim/jobs/${encodeURIComponent(id)}`,
    body,
    label: "Sponsored claim",
  }) as Promise<{ signature: string; job: ClaimJob }>;
}

async function submitSponsoredJob(args: {
  submitUrl: string;
  jobUrl: (id: string) => string;
  body: unknown;
  label: string;
}): Promise<{ signature: string; job: SponsoredJob }> {
  let lastError: unknown;
  for (let attempt = 0; attempt < SUBMIT_NETWORK_RETRIES; attempt++) {
    try {
      return await submitAndWaitOnce(args);
    } catch (error) {
      lastError = error;
      if (
        !isRetryableSubmitError(error) ||
        attempt === SUBMIT_NETWORK_RETRIES - 1
      ) {
        throw asError(error);
      }
      await sleep(SUBMIT_RETRY_BASE_MS * 2 ** attempt);
    }
  }
  throw asError(lastError ?? new Error(`${args.label} failed`));
}

async function submitAndWaitOnce(args: {
  submitUrl: string;
  jobUrl: (id: string) => string;
  body: unknown;
  label: string;
}): Promise<{ signature: string; job: SponsoredJob }> {
  const res = await fetch(args.submitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args.body),
  });

  let data: {
    jobId?: string;
    job?: SponsoredJob;
    signature?: string;
    error?: string;
  };
  try {
    data = (await res.json()) as typeof data;
  } catch {
    throw statusError(`${args.label} failed (${res.status})`, res.status || 502);
  }

  if (data.job?.status === "confirmed" && (data.signature || data.job.signature)) {
    const signature = data.signature ?? data.job.signature;
    if (!signature) throw new Error(`${args.label} confirmed without signature`);
    return { signature, job: data.job };
  }

  if (data.jobId) {
    return terminalJobResult(
      await pollJob(args.jobUrl(data.jobId), args.label),
      args.label,
    );
  }

  if (data.job?.status === "failed") {
    throw new Error(data.error ?? data.job.error ?? `${args.label} failed`);
  }

  if (!res.ok) {
    throw statusError(data.error ?? `${args.label} failed (${res.status})`, res.status);
  }
  throw new Error(data.error ?? `${args.label} did not confirm`);
}

function terminalJobResult(
  job: SponsoredJob,
  label: string,
): { signature: string; job: SponsoredJob } {
  if (job.status === "failed") {
    throw new Error(job.error ?? `${label} failed`);
  }
  if (!job.signature) {
    throw new Error(`${label} confirmed without signature`);
  }
  return { signature: job.signature, job };
}

async function pollJob(jobUrl: string, label: string): Promise<SponsoredJob> {
  const deadline = Date.now() + 90_000;
  let blipAttempt = 0;

  while (Date.now() < deadline) {
    try {
      const res = await fetch(jobUrl);
      const data = (await res.json()) as { job?: SponsoredJob; error?: string };
      if (!res.ok || !data.job) {
        throw statusError(
          data.error ?? `Job lookup failed (${res.status})`,
          res.status,
        );
      }
      blipAttempt = 0;
      if (data.job.status === "confirmed" || data.job.status === "failed") {
        return data.job;
      }
      // Long-poll timed out without terminal status — re-issue.
    } catch (error) {
      if (!isRetryableSubmitError(error) || Date.now() >= deadline) {
        throw asError(error);
      }
      await sleep(SUBMIT_RETRY_BASE_MS * 2 ** Math.min(blipAttempt, 3));
      blipAttempt += 1;
    }
  }
  throw new Error(`Timed out waiting for ${label.toLowerCase()}`);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

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

function statusError(message: string, status: number): Error {
  const err = new Error(message);
  (err as Error & { status?: number }).status = status;
  return err;
}

function asError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
