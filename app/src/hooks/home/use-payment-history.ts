"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";

import {
  fetchHistory,
  queryKeys,
  queryOptions,
  type PaymentRecord,
} from "@/lib/queries";

/** Indexed on-chain payments to/from an address. Polls every 60s while Activity is open. */
export function usePaymentHistory(address: string | null) {
  return useQuery<PaymentRecord[]>({
    queryKey: queryKeys.history.byAddress(address),
    queryFn: () => fetchHistory(address!),
    enabled: Boolean(address),
    placeholderData: keepPreviousData,
    ...queryOptions.live,
  });
}
