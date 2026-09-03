import type { PaymentTokenHolding } from "@/lib/tokens/payment-token";
import type {
  WalletCollectible,
  WalletPortfolio,
} from "@/lib/wallet/portfolio-types";
import { queryFetch, readJson } from "@/lib/queries/http";

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
  return {
    holdings: data.holdings ?? [],
    collectibles: data.collectibles ?? [],
  };
}
