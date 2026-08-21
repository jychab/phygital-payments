"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchHoldings,
  fetchVerifiedTokens,
  ownerQueryOptions,
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

/** Holdings-only. Pay uses `useOwnerPayDelegates` (`GET /api/pay/bootstrap`). */

export function useTokenHoldings(
  owner: string | null,
  options?: { live?: boolean },
) {
  const live = options?.live !== false;
  return useQuery<PaymentTokenHolding[]>({
    queryKey: queryKeys.holdings.byOwner(owner),
    queryFn: () => fetchHoldings(owner!),
    enabled: Boolean(owner),
    ...ownerQueryOptions(live),
  });
}

