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
import { isDelegateEnabled } from "@/lib/tokens/mint-delegate";

/** Coalesce concurrent per-mint observers into one batched RPC. */
const inflightBatches = new Map<
  string,
  Promise<Map<string, MintDelegateStatus>>
>();

function loadDelegateStatuses(
  owner: string,
  asset: string,
  mints: readonly string[],
) {
  const key = `${owner}:${asset}:${mints.join(",")}`;
  const pending = inflightBatches.get(key);
  if (pending) return pending;
  const promise = fetchDelegateStatuses(
    address(owner),
    mints.map((m) => address(m)),
    address(asset),
  ).finally(() => inflightBatches.delete(key));
  inflightBatches.set(key, promise);
  return promise;
}

function delegateStatusQuery(
  owner: string | null,
  asset: string | null,
  mint: string,
) {
  return {
    queryKey: queryKeys.delegateStatus.byOwnerAssetMint(owner, asset, mint),
    queryFn: () =>
      fetchDelegateStatus(address(owner!), address(mint), address(asset!)),
    enabled: Boolean(owner && asset && mint),
    ...queryOptions.live,
  };
}

/** Allowance for this asset's program-authority PDA on a mint ATA. */
export function useDelegateStatus(
  owner: string | null,
  asset: string | null,
  mint: Address | string,
) {
  return useQuery(delegateStatusQuery(owner, asset, String(mint)));
}

/** Per-mint observers over a batched RPC (device Pay-setup readiness). */
export function useDelegateStatuses(
  owner: string | null,
  asset: string | null,
  mints: readonly string[],
) {
  const mintsKey = mints.filter(Boolean).join(",");
  const sorted = useMemo(
    () => [...new Set(mintsKey.split(",").filter(Boolean))].sort(),
    [mintsKey],
  );

  return useQueries({
    queries: sorted.map((mint) => ({
      ...delegateStatusQuery(owner, asset, mint),
      queryFn: async () => {
        const map = await loadDelegateStatuses(owner!, asset!, sorted);
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
        isLoading: results.some((result) => result.isLoading),
        isError: results.some((result) => result.isError),
        error: results.find((result) => result.error)?.error ?? null,
        enabledMints: sorted.filter((mint) => isDelegateEnabled(data.get(mint))),
      };
    },
  });
}
