import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";
import { DeviceTapApp } from "@/components/device/tap-app";

export const metadata: Metadata = {
  title: "Device — Phygital Pay",
  description: "Check if this device is genuine",
};

/** Hold to Check, Safari NFC tap, or `/device?token=` / `?owner=&asset=` wallet finish. */
export default function DevicePage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <DeviceTapApp />
    </Suspense>
  );
}
