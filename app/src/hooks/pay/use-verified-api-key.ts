"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";

import { verifyStoredApiKey } from "@/lib/pay/api-key-client";
import { queryKeys, queryOptions } from "@/lib/queries";

/** React Query: this browser has a live API key for `wallet`. */
export function markApiKeyVerified(queryClient: QueryClient, wallet: string) {
  queryClient.setQueryData(queryKeys.apiKey.byWallet(wallet), true);
  queryClient.setQueryData(
    queryKeys.preauthRequired.byWallet(wallet),
    (prev: { required?: boolean; keyOk?: boolean } | undefined) => ({
      required: prev?.required ?? true,
      keyOk: true,
    }),
  );
}

export function useVerifiedApiKey(wallet: string | null) {
  return useQuery({
    queryKey: queryKeys.apiKey.byWallet(wallet),
    queryFn: () => {
      if (!wallet) throw new Error("wallet required");
      return verifyStoredApiKey(wallet);
    },
    enabled: Boolean(wallet),
    ...queryOptions.default,
    retry: false,
  });
}
