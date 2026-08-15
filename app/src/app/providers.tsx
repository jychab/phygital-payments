"use client";

import { useState, type ReactNode } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/sonner";

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
 * Shared by all routes: React Query + toasts. No Privy / WalletConnect.
 */
export function AppProviders({ children }: { children: ReactNode }) {
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
      {children}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

/**
 * Wallet routes only (`/`, `/setup`). Do not wrap `/asset` or `/collect`.
 */
export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  const [config] = useState(() => getPrivyConfig());

  return (
    <PrivyProvider appId={privyAppId} config={config}>
      {children}
    </PrivyProvider>
  );
}
