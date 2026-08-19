"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";

const PrivyWalletProvider = dynamic(
  () =>
    import("../privy-wallet-provider").then((m) => m.PrivyWalletProvider),
  { ssr: false, loading: () => <EmbedBoot /> },
);

/** Home + setup + device/finish — Privy / wallet connect, browser-only. */
export default function WalletLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://auth.privy.io" />
      <link rel="preconnect" href="https://api.privy.io" />
      <PrivyWalletProvider>{children}</PrivyWalletProvider>
    </>
  );
}
