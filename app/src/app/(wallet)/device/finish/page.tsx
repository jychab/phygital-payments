import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";
import { DeviceFinishApp } from "@/components/wallet-client-apps";

export const metadata: Metadata = {
  title: "Finish Pay setup — Phygital Pay",
  description: "Connect wallet to add your NFC device, set a spending limit, or enable Pay",
};

/** Wallet in-app browser finish — Privy via (wallet) layout. */
export default function FinishDevicePage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <DeviceFinishApp />
    </Suspense>
  );
}
