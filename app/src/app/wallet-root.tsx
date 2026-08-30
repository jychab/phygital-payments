"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";

/**
 * `ssr: false` keeps Privy / Solana wallet SDKs out of the Cloudflare Worker bundle.
 */
const SolanaWalletProvider = dynamic(
  () => import("./wallet-provider").then((m) => m.SolanaWalletProvider),
  { ssr: false, loading: () => <EmbedBoot /> },
);

/** App-wide Privy mount so the wallet chip works on every route. */
export function WalletRoot({ children }: { children: ReactNode }) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
