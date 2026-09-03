"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchWalletPortfolio } from "@/lib/wallet/holdings-client";
import { queryKeys, queryOptions } from "@/lib/queries";

export function useWalletPortfolio(walletAddress: string | null) {
  return useQuery({
    queryKey: queryKeys.walletPortfolio.byOwner(walletAddress),
    queryFn: () => fetchWalletPortfolio(walletAddress!),
    enabled: Boolean(walletAddress),
    ...queryOptions.default,
  });
}
