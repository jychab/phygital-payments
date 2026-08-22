import type { Metadata } from "next";
import { Suspense } from "react";

import { AccessoryApp } from "@/components/accessory/accessory-app";
import { AppBoot } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Card",
  description: "Check if this card is genuine, then claim it to a wallet",
};

/** Accessories with a linked mint — Hold to Check, signed NFC URL, or in-page claim. */
export default function CardsPage() {
  return (
    <Suspense fallback={<AppBoot modeLabel="Card" />}>
      <AccessoryApp showCollectible modeLabel="Card" />
    </Suspense>
  );
}
