/** Well-known Solana Compute Budget program (wallet injects at send). */
export const COMPUTE_BUDGET_PROGRAM_ADDRESS =
  "ComputeBudget111111111111111111111111111111" as const;

/**
 * Account fields treated as send recipients in STANDARD layouts
 * (owner before ATA). Used for fail `destination` and allowlist baking.
 */
export const RECIPIENT_ACCOUNT_FIELDS = [
  "destinationOwner",
  "newLeafOwner",
  "newOwner",
  "wallet",
  "destination",
] as const;
