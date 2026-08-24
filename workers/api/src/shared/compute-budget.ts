/** Compute-budget policy for sponsored / agent-signed txs. */

export const COMPUTE_BUDGET_PROGRAM_ADDRESS =
  "ComputeBudget111111111111111111111111111111";

/** Priority fee applied to sponsored / agent-signed txs (micro-lamports). */
export const PRIORITY_FEE_MICRO_LAMPORTS = 10_000n;
/** Safety margin applied to simulated compute units. */
export const COMPUTE_UNIT_MARGIN = 1.15;
/** Hard cap on the requested compute-unit limit. */
export const MAX_COMPUTE_UNITS = 1_400_000;
