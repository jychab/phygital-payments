import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";

export type WalletCollectible = {
  mint: string;
  name: string;
  image: string | null;
  collectionName: string | null;
};

export type WalletPortfolio = {
  holdings: PaymentTokenHolding[];
  collectibles: WalletCollectible[];
  totalUsd: number;
};
