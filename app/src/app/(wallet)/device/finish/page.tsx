import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/embed-error";
import { FinishClaimApp } from "@/components/wallet-client-apps";

export const metadata: Metadata = {
  title: "Finish Pay setup — Phygital Pay",
  description: "Connect wallet to add your NFC device, set a spending cap, or allow a payment verifier",
};

/** Wallet in-app browser finish — Privy via (wallet) layout. */
export default function FinishDevicePage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <FinishClaimApp />
    </Suspense>
  );
}
