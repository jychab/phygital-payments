import type { Metadata } from "next";
import { Suspense } from "react";

import { AccessoryApp } from "@/components/accessory/accessory-app";
import { AppBoot } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Accessory",
  description: "Check if this accessory is genuine, then claim it to a wallet",
};

export default function Home() {
  return (
    <Suspense fallback={<AppBoot />}>
      <AccessoryApp />
    </Suspense>
  );
}
