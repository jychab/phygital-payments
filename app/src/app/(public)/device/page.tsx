import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/embed-error";
import { AssetApp } from "@/components/asset-app";

export const metadata: Metadata = {
  title: "Device — Phygital Pay",
  description: "Manage tap-to-pay for your NFC device",
};

export default function DevicePage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <AssetApp />
    </Suspense>
  );
}
