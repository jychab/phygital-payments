"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys, queryOptions } from "@/lib/queries";
import { fetchVerifiedTokens } from "@/lib/wallet/verified-tokens-client";

export function useVerifiedTokens(enabled = true) {
  return useQuery({
    queryKey: queryKeys.verifiedTokens.all(),
    queryFn: () => fetchVerifiedTokens(),
    enabled,
    ...queryOptions.stable,
  });
}
