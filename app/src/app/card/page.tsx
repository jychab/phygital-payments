import type { Metadata } from "next";
import { Suspense } from "react";

import { CardApp } from "@/components/card/card-app";
import { AppBoot } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Card",
  description: "Check if this card is genuine, then claim it to a wallet",
};

export default function CardPage() {
  return (
    <Suspense fallback={<AppBoot modeLabel="Card" />}>
      <CardApp />
    </Suspense>
  );
}
