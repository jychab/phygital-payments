"use client";

import { useState, type ReactNode } from "react";
import { PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

import { GateMessage } from "@/components/gate-message";
import { Wallet } from "lucide-react";

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

  if (!privyAppId) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-destructive" />}
        title="Wallet connect isn't configured"
        body="Set NEXT_PUBLIC_PRIVY_APP_ID in .dev.vars and restart the dev server."
        destructive
      />
    );
  }

  return (
    <PrivyProvider appId={privyAppId} config={config}>
      {children}
    </PrivyProvider>
  );
}
