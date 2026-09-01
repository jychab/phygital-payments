"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchVerifiedTokens,
  queryKeys,
  queryOptions,
  type PaymentToken,
} from "@/lib/queries";

export function useVerifiedTokens() {
  return useQuery<PaymentToken[]>({
    queryKey: queryKeys.verifiedTokens.all(),
    queryFn: fetchVerifiedTokens,
    ...queryOptions.stable,
  });
}
