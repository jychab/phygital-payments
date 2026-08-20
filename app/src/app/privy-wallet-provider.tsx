"use client";

import { type ReactNode } from "react";
import { type PrivyClientConfig, PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { Wallet } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { createSolanaRpcSubscriptions, createSolanaRpc } from "@solana/kit";
import { RPC_URL, rpcSubscriptionsUrl } from "@/lib/solana/cluster";

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

/**
 * Create connectors once at module load so wallet-standard detection starts
 * before the user taps Connect — not on first modal open.
 */
const solanaConnectors = toSolanaWalletConnectors();

const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: "dark",
    walletChainType: "solana-only",
    showWalletLoginFirst: true,
    walletList: ["phantom", "solflare", "backpack", "detected_solana_wallets"],
  },
  loginMethods: ["google", "wallet"],
  embeddedWallets: {
    solana: { createOnLogin: "users-without-wallets" },
  },
  externalWallets: {
    solana: { connectors: solanaConnectors },
  },
  solana: {
    rpcs: {
      "solana:mainnet": {
        rpc: createSolanaRpc(RPC_URL),
        rpcSubscriptions: createSolanaRpcSubscriptions(rpcSubscriptionsUrl()),
      },
    },
  },
};

/**
 * Wallet routes (`/`, `/setup`). `/device` loads Privy only for `?token=` / `?owner=&asset=`.
 * Do not wrap `/collect`. Loaded via `next/dynamic({ ssr: false })` so `@privy-io/react-auth`
 * never runs on the server.
 */
export function PrivyWalletProvider({ children }: { children: ReactNode }) {
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
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      {children}
    </PrivyProvider>
  );
}
