"use client";

import { useQuery } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import {
  fetchDelegateStatus,
  ownerQueryOptions,
  queryKeys,
} from "@/lib/queries";

/** Allowance for this token's program-authority PDA on a mint ATA. */
export function useDelegateStatus(
  owner: string | null,
  tokenAddress: string | null,
  mint: Address | string,
  options?: { live?: boolean; enabled?: boolean },
) {
  const live = options?.live !== false;
  const mintKey = String(mint);
  const enabled =
    options?.enabled ?? Boolean(owner && tokenAddress && mintKey);
  return useQuery({
    queryKey: queryKeys.delegateStatus.byOwnerTokenMint(
      owner,
      tokenAddress,
      mintKey,
    ),
    queryFn: () =>
      fetchDelegateStatus(
        address(owner!),
        address(mintKey),
        address(tokenAddress!),
      ),
    enabled,
    ...ownerQueryOptions(live),
  });
}
