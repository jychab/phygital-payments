"use client";

import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchPayBootstrap,
  ownerQueryOptions,
  queryKeys,
  type OwnerPayDelegates,
  type PaymentTokenHolding,
} from "@/lib/queries";

function seedPayBootstrap(
  queryClient: ReturnType<typeof useQueryClient>,
  owner: string,
  holdings: PaymentTokenHolding[],
  data: OwnerPayDelegates,
) {
  queryClient.setQueryData(queryKeys.holdings.byOwner(owner), holdings);
  queryClient.setQueryData(
    queryKeys.phygitalToken.byOwner(owner),
    data.tokens,
  );
  for (const [key, status] of data.statusByTokenMint) {
    const [token, mint] = key.split("|");
    if (!token || !mint) continue;
    queryClient.setQueryData(
      queryKeys.delegateStatus.byOwnerTokenMint(owner, token, mint),
      status,
    );
  }
}

/** Wallet-scoped Pay scan: holdings ∩ owned tokens vs SPL ATA delegates. */
export function useOwnerPayDelegates(
  owner: string | null,
  options?: { live?: boolean },
) {
  const live = options?.live !== false;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.ownerPayDelegates.byOwner(owner),
    queryFn: async () => {
      const result = await fetchPayBootstrap(owner!);
      seedPayBootstrap(queryClient, owner!, result.holdings, result.delegates);
      return result;
    },
    enabled: Boolean(owner),
    placeholderData: keepPreviousData,
    ...ownerQueryOptions(live),
  });

  return {
    ...query,
    data: query.data?.delegates,
    holdings: query.data?.holdings,
  };
}
