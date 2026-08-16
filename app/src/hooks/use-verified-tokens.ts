"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchHoldings,
  fetchVerifiedTokens,
  queryKeys,
  queryOptions,
  type PaymentToken,
  type PaymentTokenHolding,
} from "@/lib/queries";

export function useVerifiedTokens() {
  return useQuery<PaymentToken[]>({
    queryKey: queryKeys.verifiedTokens.all(),
    queryFn: fetchVerifiedTokens,
    ...queryOptions.stable,
  });
}

export function useTokenHoldings(owner: string | null) {
  return useQuery<PaymentTokenHolding[]>({
    queryKey: queryKeys.holdings.byOwner(owner),
    queryFn: () => fetchHoldings(owner!),
    enabled: Boolean(owner),
    ...queryOptions.frequent,
  });
}
