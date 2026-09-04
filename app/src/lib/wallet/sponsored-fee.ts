/** Conservative fee estimate for default-verifier paymaster — mirrors api/src/fees/constants.ts. */
export const FEE_BASE_LAMPORTS = 5_000;
export const FEE_LAMPORTS_PER_IX = 50_000;

export function requiredFeeLamports(instructionCount: number): number {
  const n = Math.max(0, instructionCount);
  return FEE_BASE_LAMPORTS + FEE_LAMPORTS_PER_IX * n;
}

export function lamportsToSolUi(lamports: number | bigint): string {
  const n = Number(lamports);
  if (!Number.isFinite(n)) return "0";
  return (n / 1e9).toFixed(9).replace(/\.?0+$/, "") || "0";
}

/** Human fee display — cap at 6 decimals, round up so estimate never understates. */
export function formatSponsoredFeeUi(lamports: number | bigint): string {
  const n = Number(lamports);
  if (!Number.isFinite(n) || n <= 0) return "0";
  const roundedUp = Math.ceil(n / 1_000) * 1_000; // nearest 0.000001 SOL
  const sol = roundedUp / 1e9;
  return sol.toFixed(6).replace(/\.?0+$/, "") || "0";
}

/**
 * Body instruction count for a send intent (before wrap / compute budget).
 * Matches buildSendInstructions in send-asset.ts.
 */
export function estimateSendBodyIxCount(
  kind: "native" | "fungible" | "nft" | "pnft" | "cnft" | "core",
): number {
  switch (kind) {
    case "native":
      return 1;
    case "fungible":
    case "nft":
    case "pnft":
      return 2; // create ATA idempotent + transfer
    case "cnft":
    case "core":
      return 1;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function estimateSponsoredFeeLamports(
  kind: "native" | "fungible" | "nft" | "pnft" | "cnft" | "core",
): number {
  return requiredFeeLamports(estimateSendBodyIxCount(kind));
}
