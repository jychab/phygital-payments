/** Shared wire types for sponsored transfer submit (client ↔ DO). */

export const MAX_BATCH_SIZE = 8;
export const BATCH_WINDOW_MS = 200;
/** Force flush if oldest job older than this (slot hash safety). */
export const FORCE_FLUSH_AGE_MS = 10_000;
/** Reject enqueue if slot/job older than this. */
export const MAX_JOB_AGE_MS = 45_000;
/** Max flush attempts before a job is marked failed on transient errors. */
export const MAX_SUBMIT_ATTEMPTS = 3;
/** Base backoff between transient retry alarms (ms). */
export const RETRY_BACKOFF_MS = 750;

/** Near-immediate flush delay when the queue has been idle (single terminal). */
export const IDLE_FLUSH_MS = 15;
/** How recently another job must have arrived to widen the batch window. */
export const BATCH_ACTIVITY_WINDOW_MS = 1_000;

/** Cached blockhash freshness before the DO refetches it. */
export const BLOCKHASH_TTL_MS = 2_000;

/** Priority fee (micro-lamports per compute unit) to land in the next block. */
export const PRIORITY_FEE_MICRO_LAMPORTS = 10_000n;
/** Safety margin applied to simulated compute units. */
export const COMPUTE_UNIT_MARGIN = 1.15;
/** Hard cap on the requested compute-unit limit. */
export const MAX_COMPUTE_UNITS = 1_400_000;

/** How long to wait for `confirmed` before giving up on a submission. */
export const CONFIRM_TIMEOUT_MS = 30_000;
/** Long-poll hold time for job status waits (ms). */
export const JOB_WAIT_TIMEOUT_MS = 10_000;

export type BytesBase64 = string;

export type Secp256r1VerifyEntryWire = {
  publicKey: BytesBase64;
  signature: BytesBase64;
  message: BytesBase64;
};

export type TransferAccountsWire = {
  asset: string;
  mint: string;
  recipient: string;
  programAuthority: string;
  senderTokenAccount: string;
  recipientTokenAccount: string;
  tokenProgram: string;
  amount: string; // u64 decimal string
  slotNumber: string; // u64 decimal string
  clientDataJson: BytesBase64;
};

export type SubmitTransferRequest = {
  secpEntry: Secp256r1VerifyEntryWire;
  transfer: TransferAccountsWire;
  /** Client-side createdAt for freshness checks (ms). */
  createdAtMs?: number;
};

export type JobStatus = "queued" | "submitted" | "confirmed" | "failed";

export type TransferJob = {
  id: string;
  createdAtMs: number;
  slotNumber: string;
  secpEntry: Secp256r1VerifyEntryWire;
  transfer: TransferAccountsWire;
  status: JobStatus;
  /** Number of flush attempts made so far (for transient retry bounding). */
  attempts: number;
  signature?: string;
  error?: string;
  /**
   * Background settlement outcome after the UI was released at `processed`:
   * `confirmed` once the cluster confirms, `dropped` if it never did (rare —
   * needs reconciliation). Absent until the background settle resolves.
   */
  settled?: "confirmed" | "dropped";
};

export type SubmitTransferResponse = {
  jobId: string;
};

export type JobStatusResponse = {
  job: TransferJob;
};

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}
