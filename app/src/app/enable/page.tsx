import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/embed-error";
import { EnableApp } from "@/components/enable-app";

export const metadata: Metadata = {
  title: "Enable Pay — Phygital Pay",
  description: "Turn on tap-to-pay for your NFC device",
};

export default function EnablePage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <EnableApp />
    </Suspense>
  );
}
