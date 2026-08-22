import type { Metadata } from "next";
import { Suspense } from "react";

import { AppBoot } from "@/components/layout/app-shell";
import { AccessoryApp } from "@/components/accessory/accessory-app";

export const metadata: Metadata = {
  title: "Accessory",
  description: "Check if this accessory is genuine, then claim it to a wallet",
};

/** Hold to Check, signed NFC URL, or in-page claim. */
export default function Home() {
  return (
    <Suspense fallback={<AppBoot />}>
      <AccessoryApp />
    </Suspense>
  );
}
