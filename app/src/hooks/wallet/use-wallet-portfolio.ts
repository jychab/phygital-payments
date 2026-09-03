"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys, queryOptions } from "@/lib/queries";
import { fetchWalletPortfolioFromDas } from "@/lib/wallet/portfolio-from-das";

export function useWalletPortfolio(walletAddress: string | null) {
  return useQuery({
    queryKey: queryKeys.walletPortfolio.byOwner(walletAddress),
    queryFn: () => fetchWalletPortfolioFromDas(walletAddress!),
    enabled: Boolean(walletAddress),
    ...queryOptions.default,
  });
}
