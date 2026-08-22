/** Client-safe portfolio types returned by `/api/wallet/assets`. */

export type WalletHoldingKind = "native" | "fungible" | "collectible";

export type WalletHolding = {
  kind: WalletHoldingKind;
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  /** Raw balance in smallest units (string for JSON). */
  balance: string;
  decimals: number;
  uiAmount: number;
  usdValue: number | null;
};

export type WalletPortfolio = {
  vaultPda: string;
  nativeLamports: string;
  /** Native SOL + fungible tokens; collectibles excluded. */
  totalUsd: number | null;
  solEquivalent: number | null;
  tokens: WalletHolding[];
  collectibles: WalletHolding[];
};

export function formatUsd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatTokenAmount(amount: number, maxFraction = 4): string {
  if (!Number.isFinite(amount)) return "—";
  if (amount === 0) return "0";
  if (amount >= 1_000_000) {
    return new Intl.NumberFormat(undefined, {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(amount);
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  }).format(amount);
}
