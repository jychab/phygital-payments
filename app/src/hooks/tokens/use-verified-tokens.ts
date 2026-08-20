"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchHoldings,
  fetchPayContext,
  fetchVerifiedTokens,
  ownerQueryOptions,
  queryKeys,
  queryOptions,
  type PaymentToken,
  type PaymentTokenHolding,
  type PayTokenContext,
} from "@/lib/queries";

export function useVerifiedTokens() {
  return useQuery<PaymentToken[]>({
    queryKey: queryKeys.verifiedTokens.all(),
    queryFn: fetchVerifiedTokens,
    ...queryOptions.stable,
  });
}

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

/** Catalog + holdings in one request (Pay manage screens). */
export function usePayTokenContext(
  owner: string | null,
  options?: { live?: boolean },
) {
  const live = options?.live !== false;
  return useQuery<PayTokenContext>({
    queryKey: queryKeys.payContext.byOwner(owner),
    queryFn: () => fetchPayContext(owner!),
    enabled: Boolean(owner),
    ...ownerQueryOptions(live),
  });
}
