"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";

/**
 * `ssr: false` keeps `@solana/connector` out of the Cloudflare Worker bundle.
 */
const SolanaWalletProvider = dynamic(
  () => import("./wallet-provider").then((m) => m.SolanaWalletProvider),
  { ssr: false, loading: () => <EmbedBoot /> },
);

const WalletConnectPicker = dynamic(
  () =>
    import("@/components/shared/wallet-connect-picker").then(
      (m) => m.WalletConnectPicker,
    ),
  { ssr: false, loading: () => null },
);

/** App-wide ConnectorKit mount so the wallet chip works on every route. */
export function WalletRoot({ children }: { children: ReactNode }) {
  return (
    <SolanaWalletProvider>
      {children}
      <WalletConnectPicker />
    </SolanaWalletProvider>
  );
}
