"use client";

import { useState } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

/** Stable config — recreating this each render makes Privy's modal remount list children without keys. */
const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    walletChainType: "solana-only",
    showWalletLoginFirst: true,
    // Explicit Solana wallets first, then other detected extensions.
    // Putting `detected_solana_wallets` first (or alone with duplicates) can
    // make Privy's modal render Fragment children without keys.
    walletList: [
      "phantom",
      "solflare",
      "backpack",
      "detected_solana_wallets",
      "wallet_connect_qr_solana",
    ],
  },
  loginMethods: ["google", "wallet"],
  embeddedWallets: {
    // Only mint an embedded Solana wallet when the user has none
    // (e.g. email/Google login). External wallets like Phantom already
    // satisfy the wallet requirement — "all-users" would create a second one.
    solana: { createOnLogin: "users-without-wallets" },
  },
  externalWallets: {
    solana: { connectors: toSolanaWalletConnectors() },
  }
};


/**
 * Privy owns login + Solana wallets. Server state lives in React Query and is
 * intentionally not persisted — pay limits and payment data must always reflect
 * on-chain reality.
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
    <PrivyProvider
      appId={privyAppId}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </PrivyProvider>
  );
}
