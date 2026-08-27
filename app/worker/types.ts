/**
 * Worker constants. Wire types live in `../shared/submitter-wire`;
 * base64 helpers in `../shared/base64`.
 */

export type {
  BytesBase64,
  Secp256r1VerifyEntryWire,
  TransferAccountsWire,
  SubmitTransferRequest,
  JobStatus,
  TransferJob,
  JobStatusResponse,
} from "../shared/submitter-wire";

export { base64ToBytes } from "../shared/base64";

export const MAX_BATCH_SIZE = 8;
export const BATCH_WINDOW_MS = 1000;
/** Force flush if oldest job older than this (slot hash safety). */
export const FORCE_FLUSH_AGE_MS = 10_000;
/** Reject enqueue if slot/job older than this. */
export const MAX_JOB_AGE_MS = 45_000;
/** Max flush attempts before a job is marked failed on transient errors. */
export const MAX_SUBMIT_ATTEMPTS = 3;
/** Base backoff between transient retry alarms (ms). */
export const RETRY_BACKOFF_MS = 750;

/**
 * Fixed CU budget for a single secp + transfer (skips simulation RTT).
 * Measured ~29k CU for Token-2022 + verify CPI; keep headroom for TLV mints.
 * Multi-job batches still simulate for a tight limit.
 */
export const SINGLE_JOB_COMPUTE_UNITS = 50_000;

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
