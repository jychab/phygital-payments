"use client";

import { useMemo, type ReactNode } from "react";
import { AppProvider } from "@solana/connector/react";
import {
  getDefaultConfig,
  getDefaultMobileConfig,
} from "@solana/connector/headless";

import { brand } from "@/lib/copy/phygital";
import { getChainId, RPC_URL } from "@/lib/solana/cluster";

const APP_NAME = brand.company;

/** ConnectorKit provider. Mounted once from `WalletRoot` (dynamic, client-only). */
export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const { connectorConfig, mobile } = useMemo(() => {
    const chainId = getChainId();
    const appUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://revibase.com";

    return {
      connectorConfig: getDefaultConfig({
        appName: APP_NAME,
        appUrl,
        autoConnect: true,
        enableMobile: true,
        clusters: [
          {
            id: chainId,
            label: chainId === "solana:mainnet" ? "Mainnet" : "Devnet",
            url: RPC_URL,
          },
        ],
        wallets: {
          featured: ["Phantom", "Solflare", "Backpack"],
        },
      }),
      mobile: getDefaultMobileConfig({
        appName: APP_NAME,
        appUrl,
      }),
    };
  }, []);

  return (
    <AppProvider connectorConfig={connectorConfig} mobile={mobile}>
      {children}
    </AppProvider>
  );
}
