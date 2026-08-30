"use client";

import { useMemo, type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import {
  createDefaultAuthorizationCache,
  createDefaultChainSelector,
  createDefaultWalletNotFoundHandler,
  registerMwa,
} from "@solana-mobile/wallet-standard-mobile";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

import { brand } from "@/lib/copy/phygital";
import { getChainId, RPC_URL, rpcSubscriptionsUrl } from "@/lib/solana/cluster";

const APP_NAME = brand.company;
const APP_URL = "https://app.revibase.com";
const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

const solanaConnectors = toSolanaWalletConnectors({
  shouldAutoConnect: true,
});

/** Register MWA once so Android SMS wallets appear via Wallet Standard. */
let mwaRegistered = false;
function ensureMwaRegistered() {
  if (mwaRegistered || typeof window === "undefined") return;
  mwaRegistered = true;
  registerMwa({
    appIdentity: {
      name: APP_NAME,
      uri: APP_URL,
      icon: "favicon.ico",
    },
    authorizationCache: createDefaultAuthorizationCache(),
    chains: [getChainId()],
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  });
}

/** Privy + Solana (detected wallets, MWA, Google → embedded). Client-only via WalletRoot. */
export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  ensureMwaRegistered();

  const chainId = getChainId();
  const config = useMemo(
    () => ({
      loginMethods: ["google", "wallet"] as ("google" | "wallet")[],
      appearance: {
        theme: "dark" as const,
        // Near-white primary matches app buttons on the gallery-dark canvas.
        accentColor: "#E9EBEE" as `#${string}`,
        logo: "",
        landingHeader: APP_NAME,
        walletChainType: "solana-only" as const,
        walletList: ["detected_solana_wallets"] as ("detected_solana_wallets")[],
      },
      externalWallets: {
        solana: {
          connectors: solanaConnectors,
        },
      },
      embeddedWallets: {
        solana: {
          createOnLogin: "users-without-wallets" as const,
        },
      },
      solana: {
        rpcs: {
          [chainId]: {
            rpc: createSolanaRpc(RPC_URL),
            rpcSubscriptions: createSolanaRpcSubscriptions(rpcSubscriptionsUrl()),
          },
        },
      },
    }),
    [chainId],
  );

  if (!PRIVY_APP_ID) {
    throw new Error(
      "Missing NEXT_PUBLIC_PRIVY_APP_ID. Add it to app/.dev.vars (see .dev.vars.example).",
    );
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={config}>
      {children}
    </PrivyProvider>
  );
}
