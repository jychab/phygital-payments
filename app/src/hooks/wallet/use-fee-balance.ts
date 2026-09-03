"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchFeeBalance } from "@/lib/wallet/fee-balance-client";
import { queryKeys, queryOptions } from "@/lib/queries";

export function useFeeBalance(phygitalToken: string | null) {
  return useQuery({
    queryKey: queryKeys.feeBalance.byToken(phygitalToken),
    queryFn: () => fetchFeeBalance(phygitalToken!),
    enabled: Boolean(phygitalToken),
    ...queryOptions.default,
  });
}
