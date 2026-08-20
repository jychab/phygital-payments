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
 * Route `/` — Pay, Devices, and Activity tabs (Privy).
 * NFC devices and first-time setup start by tapping a tag (opens `/device`).
 */
export function HomeApp() {
  return <HomeWalletShell />;
}
