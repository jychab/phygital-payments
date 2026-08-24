"use client";

import { useRef, useState, type ReactNode } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { Toaster } from "@/components/ui/sonner";
import { useResumeQueryRefresh } from "@/hooks/layout/use-resume-query-refresh";
import { SmartWalletProvider } from "@/hooks/wallet/use-smart-wallet";
import {
  CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE_MS,
  createQueryPersister,
  shouldDehydrateQuery,
} from "@/lib/queries/persist";
import { queryOptions } from "@/lib/queries";

/** Real persister on the client; SSR/hydration must not freeze the no-op from `useState`. */
function useQueryPersister() {
  const persisterRef = useRef<ReturnType<typeof createQueryPersister> | null>(
    null,
  );
  if (typeof window !== "undefined" && persisterRef.current === null) {
    persisterRef.current = createQueryPersister();
  }
  return persisterRef.current ?? createQueryPersister();
}

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
  const persister = useQueryPersister();

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
      <SmartWalletProvider>
        <ResumeQueryRefresh />
        {children}
        <Toaster richColors position="top-center" />
      </SmartWalletProvider>
    </PersistQueryClientProvider>
  );
}

function ResumeQueryRefresh() {
  useResumeQueryRefresh();
  return null;
}
