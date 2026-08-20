"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { address } from "@solana/kit";

import { usePhygitalTokensByOwner } from "@/hooks/home/use-phygital-tokens-by-owner";
import { useTokenHoldings } from "@/hooks/tokens/use-payment-tokens";
import {
  fetchOwnerPayDelegates,
  ownerQueryOptions,
  queryKeys,
  type OwnerPayDelegates,
} from "@/lib/queries";
import { mintsFromHoldings } from "@/lib/tokens/payment-token";

function seedDelegateStatus(
  queryClient: ReturnType<typeof useQueryClient>,
  owner: string,
  data: OwnerPayDelegates,
) {
  for (const [mint, match] of data.byMint) {
    if (!match.token || !match.status) continue;
    queryClient.setQueryData(
      queryKeys.delegateStatus.byOwnerTokenMint(
        owner,
        String(match.token),
        mint,
      ),
      match.status,
    );
  }
}

/** Wallet-scoped Pay scan: owned tokens vs SPL ATA delegates. No device pick. */
export function useOwnerPayDelegates(
  owner: string | null,
  options?: { live?: boolean },
) {
  const live = options?.live !== false;
  const queryClient = useQueryClient();
  const holdings = useTokenHoldings(owner, { live });
  const tokensQuery = usePhygitalTokensByOwner(owner);
  const mints = useMemo(
    () => mintsFromHoldings(holdings.data),
    [holdings.data],
  );
  const mintsKey = mints.join(",");
  const tokens = tokensQuery.data ?? [];
  const tokensKey = tokens.map((item) => String(item.address)).join(",");

  const query = useQuery<OwnerPayDelegates, Error>({
    queryKey: [
      ...queryKeys.ownerPayDelegates.byOwner(owner),
      mintsKey,
      tokensKey,
    ],
    queryFn: async () => {
      const result = await fetchOwnerPayDelegates(
        address(owner!),
        mints.map((m) => address(m)),
        tokens,
      );
      seedDelegateStatus(queryClient, owner!, result);
      return result;
    },
    enabled: Boolean(owner) && tokensQuery.isSuccess,
    placeholderData: keepPreviousData,
    ...ownerQueryOptions(live),
  });

  return {
    ...query,
    isPending:
      Boolean(owner) &&
      (tokensQuery.isPending || (tokensQuery.isSuccess && query.isPending)),
    isLoading:
      tokensQuery.isLoading ||
      (tokensQuery.isSuccess && query.isLoading),
    isError: holdings.isError || tokensQuery.isError || query.isError,
    error: holdings.error ?? tokensQuery.error ?? query.error,
  };
}
