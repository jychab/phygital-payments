import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";
import type {
  WalletCollectible,
  WalletPortfolio,
} from "@/lib/wallet/portfolio-types";
import { queryFetch, readJson } from "@/lib/queries/http";

function usdcTotal(holdings: PaymentTokenHolding[]): number {
  const usdc = holdings.find((h) => h.symbol === "USDC");
  if (!usdc) return 0;
  const n = Number(usdc.balanceUi);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchWalletPortfolio(
  owner: string,
): Promise<WalletPortfolio> {
  const res = await queryFetch(
    `/tokens/portfolio?owner=${encodeURIComponent(owner)}`,
  );
  const data = await readJson<{
    holdings?: PaymentTokenHolding[];
    collectibles?: WalletCollectible[];
  }>(res, "Couldn’t load wallet");
  const holdings = data.holdings ?? [];
  return {
    holdings,
    collectibles: data.collectibles ?? [],
    totalUsd: usdcTotal(holdings),
  };
}
