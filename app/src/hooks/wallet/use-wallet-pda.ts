"use client";

import { useQuery } from "@tanstack/react-query";

import { walletPdaForToken } from "@/lib/wallet/pda";
import { queryKeys, queryOptions } from "@/lib/queries";

/** Resolve wallet PDA for a phygital token address (cached local derivation). */
export function useWalletPda(tokenAddress: string | null) {
  const query = useQuery({
    queryKey: queryKeys.walletPda.byToken(tokenAddress),
    queryFn: async () => String(await walletPdaForToken(tokenAddress!)),
    enabled: Boolean(tokenAddress),
    ...queryOptions.immutable,
  });

  return {
    walletAddress: query.data ?? null,
    pending: Boolean(tokenAddress) && query.isPending,
  };
}
