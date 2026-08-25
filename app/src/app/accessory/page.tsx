import type { Metadata } from "next";
import { Suspense } from "react";

import { EmbedBoot } from "@/components/layout/embed-gate";
import { AccessoryApp } from "@/components/accessory/accessory-app";

export const metadata: Metadata = {
  title: "Accessory",
  description: "Check if this accessory is genuine",
};

/** Hold to Check, Safari NFC tap, or `/accessory?token=` wallet finish. */
export default function AccessoryPage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <AccessoryApp />
    </Suspense>
  );
}
