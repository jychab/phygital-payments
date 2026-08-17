"use client";

import { useState, type ReactNode } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import { Toaster } from "@/components/ui/sonner";
import {
  CACHE_BUSTER,
  QUERY_CACHE_MAX_AGE_MS,
  createQueryPersister,
  shouldDehydrateQuery,
} from "@/lib/queries/persist";
import { queryOptions } from "@/lib/queries";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

/** Stable config — recreate only when connectors singleton is ready. */
function getPrivyConfig(): PrivyClientConfig {
  return {
    appearance: {
      theme: "dark",
      walletChainType: "solana-only",
      showWalletLoginFirst: true,
      walletList: [
        "phantom",
        "solflare",
        "backpack",
        "detected_solana_wallets",
        "wallet_connect_qr_solana",
      ],
    },
    // Wallet connect only — no email/social login or embedded-wallet creation.
    loginMethods: ["wallet"],
    externalWallets: {
      solana: { connectors: toSolanaWalletConnectors() },
    },
  };
}

/**
 * Shared by all routes: React Query (localStorage-persisted) + toasts.
 * No Privy / WalletConnect.
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
      {children}
      <Toaster richColors position="top-center" />
    </PersistQueryClientProvider>
  );
}

/**
 * Wallet routes (`/`, `/setup`, `/device/finish`). Do not wrap `/collect` or `/device`.
 */
export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  const [config] = useState(() => getPrivyConfig());

  return (
    <PrivyProvider appId={privyAppId} config={config}>
      {children}
    </PrivyProvider>
  );
}
