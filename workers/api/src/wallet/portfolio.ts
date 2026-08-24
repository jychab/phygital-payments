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
