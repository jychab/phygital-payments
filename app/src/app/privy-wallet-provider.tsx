"use client";

import { useState, type ReactNode } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

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
 * Wallet routes (`/`, `/setup`, `/device/finish`). Do not wrap `/collect` or `/device`.
 * Loaded via `next/dynamic({ ssr: false })` so `@privy-io/react-auth` never runs on the server.
 */
export function PrivyWalletProvider({ children }: { children: ReactNode }) {
  const [config] = useState(() => getPrivyConfig());

  return (
    <PrivyProvider appId={privyAppId} config={config}>
      {children}
    </PrivyProvider>
  );
}
