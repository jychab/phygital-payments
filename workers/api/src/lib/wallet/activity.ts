export type WalletActivityItem = {
  signature: string;
  slot: number;
  err: boolean;
  blockTime: number | null;
  label: string;
};

const WRAPPED_SOL_MINT = "So11111111111111111111111111111111111111112";

function mintSymbol(mint: string): string {
  if (mint === "SOL" || mint === WRAPPED_SOL_MINT) return "SOL";
  if (mint.length > 8) return mint.slice(0, 4);
  return mint;
}

function formatChangeAmount(amount: number): string {
  const abs = Math.abs(amount);
  if (!Number.isFinite(abs)) return "?";
  if (abs === 0) return "0";
  if (abs >= 1_000_000) {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(abs);
  }
  if (abs >= 1) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
    }).format(abs);
  }
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 6,
  }).format(abs);
}

/** Prefer the largest absolute balance change for a human-readable label. */
export function labelFromBalanceChanges(
  changes: { mint: string; amount: number; decimals: number }[],
  failed: boolean,
): string {
  if (failed) return "Failed transaction";
  if (changes.length === 0) return "Transaction";

  const primary = changes.reduce((best, next) =>
    Math.abs(next.amount) > Math.abs(best.amount) ? next : best,
  );
  const symbol = mintSymbol(primary.mint);
  const amount = formatChangeAmount(primary.amount);
  if (primary.amount > 0) return `Received ${amount} ${symbol}`;
  if (primary.amount < 0) return `Sent ${amount} ${symbol}`;
  return "Transaction";
}
