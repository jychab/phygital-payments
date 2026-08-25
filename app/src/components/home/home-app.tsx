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
 * Route `/` — Collection hub (cards + accessories overview).
 * NFC claim/pay starts by tapping a tag (opens `/card` or `/accessory`).
 */
export function HomeApp() {
  return <HomeWalletShell />;
}
