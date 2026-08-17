"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPreauthStatus, queryKeys, queryOptions } from "@/lib/queries";

/** Wallet-level payment verifier status (D1). No Privy required. */
export function usePreauthStatus(wallet: string | null) {
  return useQuery({
    queryKey: queryKeys.preauthStatus.byWallet(wallet),
    queryFn: () => fetchPreauthStatus(wallet!),
    enabled: Boolean(wallet),
    ...queryOptions.default,
  });
}
