"use client";

import { useQuery } from "@tanstack/react-query";
import { address } from "@solana/kit";

import {
  fetchDelegateStatus,
  queryKeys,
  queryOptions,
  type UsdcDelegateStatus,
} from "@/lib/queries";

/** The connected wallet's USDC allowance (program-authority delegate) status. */
export function useDelegateStatus(owner: string | null) {
  return useQuery<UsdcDelegateStatus>({
    queryKey: queryKeys.delegateStatus.byOwner(owner),
    queryFn: () => fetchDelegateStatus(address(owner!)),
    enabled: Boolean(owner),
    ...queryOptions.default,
  });
}
