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
const APP_URL ="https://app.revibase.com";

/** ConnectorKit provider. Mounted once from `WalletRoot` (dynamic, client-only). */
export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const { connectorConfig, mobile } = useMemo(() => {
    const chainId = getChainId();

    return {
      connectorConfig: getDefaultConfig({
        appName: APP_NAME,
        appUrl: APP_URL,
        autoConnect: true,
        enableMobile: true,
        clusters: [
          {
            id: chainId,
            label: chainId === "solana:mainnet" ? "Mainnet" : "Devnet",
            url: RPC_URL,
          },
        ],
      }),
      mobile: getDefaultMobileConfig({
        appName: APP_NAME,
        appUrl: APP_URL,
      }),
    };
  }, []);

  return (
    <AppProvider connectorConfig={connectorConfig} mobile={mobile}>
      {children}
    </AppProvider>
  );
}
