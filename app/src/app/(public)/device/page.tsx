import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";
import { DeviceTapApp } from "@/components/device/tap-app";

export const metadata: Metadata = {
  title: "Device — Phygital Pay",
  description: "Manage tap-to-pay for your NFC device",
};

/** Safari NFC tap (step 1) — no Privy. */
export default function DevicePage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <DeviceTapApp />
    </Suspense>
  );
}
