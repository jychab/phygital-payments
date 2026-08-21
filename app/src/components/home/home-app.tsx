"use client";

import dynamic from "next/dynamic";

import { EmbedBoot } from "@/components/layout/embed-gate";

const HomeWalletShell = dynamic(
  () =>
    import("@/components/home/home-wallet-shell").then(
      (m) => m.HomeWalletShell,
    ),
  { ssr: false, loading: () => <EmbedBoot /> },
);

/**
 * Route `/` — Pay, Accessories, and Activity tabs (Privy).
 * NFC accessories and first-time setup start by tapping a tag (opens `/accessory`).
 */
export function HomeApp() {
  return <HomeWalletShell />;
}
