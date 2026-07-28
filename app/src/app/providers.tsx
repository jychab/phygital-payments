"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";
import { ParentWalletProvider } from "@/lib/wallet/parent-bridge";

/**
 * The app runs as an iframe embedded in the Revibase vault. It holds no wallet
 * of its own — the parent vault owns the wallet and answers address / signing
 * requests over postMessage (see lib/wallet/parent-bridge).
 *
 * Server state lives in React Query. The cache is intentionally NOT persisted:
 * allowance and payment data must always reflect on-chain reality, never a
 * stale snapshot from a previous session.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, staleTime: 1000 * 60 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ParentWalletProvider>
        {children}
        <Toaster richColors position="top-center" />
      </ParentWalletProvider>
    </QueryClientProvider>
  );
}
