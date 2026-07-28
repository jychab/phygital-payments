"use client";

import { PrivyProvider, type PrivyClientConfig } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import {
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";
import { Toaster } from "@/components/ui/sonner";

import { getChainId, rpcSubscriptionsUrl, RPC_URL } from "@/lib/solana/cluster";

const solanaConnectors = toSolanaWalletConnectors();
const chainId = getChainId();

const privyConfig: PrivyClientConfig = {
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
  loginMethods: ["wallet", "email"],
  embeddedWallets: {
    solana: { createOnLogin: "users-without-wallets" },
  },
  externalWallets: {
    solana: { connectors: solanaConnectors },
  },
  solana: {
    rpcs: {
      [chainId]: {
        rpc: createSolanaRpc(RPC_URL),
        rpcSubscriptions: createSolanaRpcSubscriptions(rpcSubscriptionsUrl()),
      },
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

  if (!appId) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
          Phygital Pay
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          Add <code className="font-mono text-foreground">NEXT_PUBLIC_PRIVY_APP_ID</code>{" "}
          to <code className="font-mono text-foreground">app/.env.local</code> (see{" "}
          <code className="font-mono text-foreground">.env.example</code>), then restart
          the dev server.
        </p>
        <Toaster richColors position="top-center" />
      </div>
    );
  }

  return (
    <PrivyProvider appId={appId} config={privyConfig}>
      {children}
      <Toaster richColors position="top-center" />
    </PrivyProvider>
  );
}
