"use client";

import { useQuery } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import {
  fetchDelegateStatus,
  ownerQueryOptions,
  queryKeys,
} from "@/lib/queries";

/** Allowance for this asset's program-authority PDA on a mint ATA. */
export function useDelegateStatus(
  owner: string | null,
  asset: string | null,
  mint: Address | string,
  options?: { live?: boolean; enabled?: boolean },
) {
  const live = options?.live !== false;
  const mintKey = String(mint);
  const enabled = options?.enabled ?? Boolean(owner && asset && mintKey);
  return useQuery({
    queryKey: queryKeys.delegateStatus.byOwnerAssetMint(owner, asset, mintKey),
    queryFn: () =>
      fetchDelegateStatus(address(owner!), address(mintKey), address(asset!)),
    enabled,
    ...ownerQueryOptions(live),
  });
}
