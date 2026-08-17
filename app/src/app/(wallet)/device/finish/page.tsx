import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/embed-error";
import { FinishClaimApp } from "@/components/wallet-client-apps";

export const metadata: Metadata = {
  title: "Finish device claim — Phygital Pay",
  description: "Connect wallet and confirm NFC device ownership",
};

/** Wallet in-app browser finish (step 2) — Privy via (wallet) layout. */
export default function FinishDevicePage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <FinishClaimApp />
    </Suspense>
  );
}
