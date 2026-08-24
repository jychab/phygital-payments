import { MAX_COMPUTE_UNIT_LIMIT } from "@solana-program/compute-budget";

export {
  COMPUTE_BUDGET_PROGRAM_ADDRESS,
  MAX_COMPUTE_UNIT_LIMIT,
} from "@solana-program/compute-budget";

/** Priority fee applied to sponsored / agent-signed txs (micro-lamports). */
export const PRIORITY_FEE_MICRO_LAMPORTS = 10_000n;
/** Safety margin applied to simulated compute units. */
export const COMPUTE_UNIT_MARGIN = 1.15;
/** Hard cap on the requested compute-unit limit. */
export const MAX_COMPUTE_UNITS = MAX_COMPUTE_UNIT_LIMIT;
