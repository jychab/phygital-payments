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

/** Catalog (stable) + holdings (live-polled). */
export function usePayTokenContext(
  owner: string | null,
  options?: { live?: boolean },
) {
  const catalog = useVerifiedTokens();
  const holdings = useTokenHoldings(owner, options);
  return {
    data:
      holdings.data != null
        ? { tokens: catalog.data ?? [], holdings: holdings.data }
        : undefined,
    isLoading: catalog.isLoading || holdings.isLoading,
    isPending: catalog.isPending || holdings.isPending,
    isError: catalog.isError || holdings.isError,
    error: catalog.error ?? holdings.error,
    isSuccess: holdings.isSuccess,
  };
}
