"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import {
  fetchDelegateStatus,
  fetchDelegateStatuses,
  queryKeys,
  queryOptions,
  type MintDelegateStatus,
} from "@/lib/queries";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";

/** The connected wallet's allowance (program-authority delegate) for a mint. */
export function useDelegateStatus(
  owner: string | null,
  mint: Address | string,
) {
  const mintStr = String(mint);
  return useQuery<MintDelegateStatus>({
    queryKey: queryKeys.delegateStatus.byOwnerMint(owner, mintStr),
    queryFn: () => fetchDelegateStatus(address(owner!), address(mintStr)),
    enabled: Boolean(owner && mintStr),
    ...queryOptions.default,
  });
}

/** Batch delegate status for many mints (Manage Pay / readiness gate). */
export function useDelegateStatuses(
  owner: string | null,
  mints: readonly string[],
) {
  const queryClient = useQueryClient();
  const mintsJoined = mints.filter(Boolean).join(",");
  const sorted = useMemo(
    () => [...new Set(mintsJoined.split(",").filter(Boolean))].sort(),
    [mintsJoined],
  );
  const mintsKey = sorted.join(",");

  const query = useQuery<Map<string, MintDelegateStatus>>({
    queryKey: queryKeys.delegateStatus.byOwnerMints(owner, mintsKey),
    queryFn: async () => {
      const map = await fetchDelegateStatuses(
        address(owner!),
        sorted.map((m) => address(m)),
      );
      for (const [mint, status] of map) {
        queryClient.setQueryData(
          queryKeys.delegateStatus.byOwnerMint(owner, mint),
          status,
        );
      }
      return map;
    },
    enabled: Boolean(owner && sorted.length > 0),
    ...queryOptions.default,
  });

  const enabledMints = useMemo(() => {
    if (!query.data) return [] as string[];
    return sorted.filter((m) => isDelegateEnabled(query.data.get(m)));
  }, [query.data, sorted]);

  return { ...query, enabledMints, mints: sorted };
}
