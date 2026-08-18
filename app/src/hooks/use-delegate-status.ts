"use client";

import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import {
  fetchDelegateStatus,
  fetchDelegateStatuses,
  queryKeys,
  queryOptions,
  type MintDelegateStatus,
} from "@/lib/queries";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";

/** Coalesce concurrent per-mint observers into one batched RPC. */
const inflightBatches = new Map<
  string,
  Promise<Map<string, MintDelegateStatus>>
>();

function loadDelegateStatuses(owner: string, mints: readonly string[]) {
  const key = `${owner}:${mints.join(",")}`;
  const pending = inflightBatches.get(key);
  if (pending) return pending;
  const promise = fetchDelegateStatuses(
    address(owner),
    mints.map((m) => address(m)),
  ).finally(() => inflightBatches.delete(key));
  inflightBatches.set(key, promise);
  return promise;
}

function delegateStatusQuery(owner: string | null, mint: string) {
  return {
    queryKey: queryKeys.delegateStatus.byOwnerMint(owner, mint),
    queryFn: () => fetchDelegateStatus(address(owner!), address(mint)),
    enabled: Boolean(owner && mint),
    ...queryOptions.default,
  };
}

/** The connected wallet's allowance (program-authority delegate) for a mint. */
export function useDelegateStatus(
  owner: string | null,
  mint: Address | string,
) {
  return useQuery(delegateStatusQuery(owner, String(mint)));
}

/** Per-mint observers over a batched RPC (Manage Pay / readiness gate). */
export function useDelegateStatuses(
  owner: string | null,
  mints: readonly string[],
) {
  const mintsKey = mints.filter(Boolean).join(",");
  const sorted = useMemo(
    () => [...new Set(mintsKey.split(",").filter(Boolean))].sort(),
    [mintsKey],
  );

  return useQueries({
    queries: sorted.map((mint) => ({
      ...delegateStatusQuery(owner, mint),
      queryFn: async () => {
        const map = await loadDelegateStatuses(owner!, sorted);
        const status = map.get(mint);
        if (!status) {
          throw new Error(`Missing delegate status for mint ${mint}`);
        }
        return status;
      },
    })),
    combine: (results) => {
      const data = new Map<string, MintDelegateStatus>();
      for (let i = 0; i < sorted.length; i++) {
        const status = results[i]?.data;
        if (status) data.set(sorted[i]!, status);
      }
      return {
        data,
        isLoading: results.some((result) => result.isLoading),
        isPending: results.some((result) => result.isPending),
        isFetching: results.some((result) => result.isFetching),
        isError: results.some((result) => result.isError),
        error: results.find((result) => result.error)?.error ?? null,
        enabledMints: sorted.filter((mint) => isDelegateEnabled(data.get(mint))),
        mints: sorted,
      };
    },
  });
}
