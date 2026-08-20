"use client";

import { useMemo } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { address } from "@solana/kit";

import { usePhygitalAssetsByOwner } from "@/hooks/home/use-phygital-assets-by-owner";
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
    if (!match.asset || !match.status) continue;
    queryClient.setQueryData(
      queryKeys.delegateStatus.byOwnerAssetMint(
        owner,
        String(match.asset),
        mint,
      ),
      match.status,
    );
  }
}

/** Wallet-scoped Pay scan: owned assets vs SPL ATA delegates. No device pick. */
export function useOwnerPayDelegates(
  owner: string | null,
  options?: { live?: boolean },
) {
  const live = options?.live !== false;
  const queryClient = useQueryClient();
  const holdings = useTokenHoldings(owner, { live });
  const assetsQuery = usePhygitalAssetsByOwner(owner);
  const mints = useMemo(
    () => mintsFromHoldings(holdings.data),
    [holdings.data],
  );
  const mintsKey = mints.join(",");
  const assets = assetsQuery.data ?? [];
  const assetsKey = assets.map((item) => String(item.address)).join(",");

  const query = useQuery<OwnerPayDelegates, Error>({
    queryKey: [
      ...queryKeys.ownerPayDelegates.byOwner(owner),
      mintsKey,
      assetsKey,
    ],
    queryFn: async () => {
      const result = await fetchOwnerPayDelegates(
        address(owner!),
        mints.map((m) => address(m)),
        assets,
      );
      seedDelegateStatus(queryClient, owner!, result);
      return result;
    },
    enabled: Boolean(owner) && assetsQuery.isSuccess,
    placeholderData: keepPreviousData,
    ...ownerQueryOptions(live),
  });

  return {
    ...query,
    isPending:
      Boolean(owner) &&
      (assetsQuery.isPending || (assetsQuery.isSuccess && query.isPending)),
    isLoading:
      assetsQuery.isLoading ||
      (assetsQuery.isSuccess && query.isLoading),
    isError: holdings.isError || assetsQuery.isError || query.isError,
    error: holdings.error ?? assetsQuery.error ?? query.error,
  };
}
