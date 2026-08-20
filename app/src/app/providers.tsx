"use client";

import { useState, type ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { PrivyWalletRoot } from "./privy-wallet-root";
import { Toaster } from "@/components/ui/sonner";
import {
  CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE_MS,
  createQueryPersister,
  shouldDehydrateQuery,
} from "@/lib/queries/persist";
import { queryOptions } from "@/lib/queries";

/**
 * Shared by all routes: React Query (localStorage-persisted, only browser cache) + toasts.
 * One Privy tree (`PrivyWalletRoot`) — the SDK loads only when a route gates on it.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...queryOptions.default,
            // Must be ≥ persist maxAge or restored queries are GC'd immediately.
            gcTime: QUERY_CACHE_MAX_AGE_MS,
          },
        },
      }),
  );
  const [persister] = useState(() => createQueryPersister());

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: QUERY_CACHE_MAX_AGE_MS,
        buster: CACHE_BUSTER,
        dehydrateOptions: { shouldDehydrateQuery },
      }}
    >
      <PrivyWalletRoot>
        {children}
        <Toaster richColors position="top-center" />
      </PrivyWalletRoot>
    </PersistQueryClientProvider>
  );
}
