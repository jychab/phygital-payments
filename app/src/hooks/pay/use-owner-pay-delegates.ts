"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { address } from "@solana/kit";

import { usePhygitalAssetsByOwner } from "@/hooks/home/use-phygital-assets-by-owner";
import {
  fetchOwnerPayDelegates,
  queryKeys,
  queryOptions,
  type OwnerPayDelegates,
} from "@/lib/queries";
import { usePayTokenContext } from "@/hooks/tokens/use-verified-tokens";
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
export function useOwnerPayDelegates(owner: string | null) {
  const queryClient = useQueryClient();
  const payContext = usePayTokenContext(owner);
  const assetsQuery = usePhygitalAssetsByOwner(owner);
  const holdingsReady = payContext.isSuccess || payContext.isError;
  const mints = useMemo(
    () => mintsFromHoldings(payContext.data?.holdings),
    [payContext.data],
  );
  const mintsKey = mints.join(",");
  const assets = assetsQuery.data ?? [];
  const assetsKey = assets.map((item) => String(item.asset)).join(",");

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
    enabled: Boolean(owner) && holdingsReady && assetsQuery.isSuccess,
    ...queryOptions.live,
  });

  return {
    ...query,
    isPending:
      Boolean(owner) &&
      (payContext.isLoading ||
        assetsQuery.isPending ||
        (assetsQuery.isSuccess && query.isPending)),
    isLoading:
      payContext.isLoading ||
      assetsQuery.isLoading ||
      (assetsQuery.isSuccess && query.isLoading),
    isError: payContext.isError || assetsQuery.isError || query.isError,
    error: payContext.error ?? assetsQuery.error ?? query.error,
  };
}
