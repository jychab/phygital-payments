/**
 * Worker constants for sponsored LazorKit submit.
 */

export const PRIORITY_FEE_MICRO_LAMPORTS = 10_000n;
/** Safety margin applied to simulated compute units. */
export const COMPUTE_UNIT_MARGIN = 1.15;
/** Hard cap on the requested compute-unit limit. */
export const MAX_COMPUTE_UNITS = 1_400_000;

/** How long to wait for `confirmed` before giving up on a submission. */
export const CONFIRM_TIMEOUT_MS = 30_000;
