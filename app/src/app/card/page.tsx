import type { Metadata } from "next";
import { Suspense } from "react";

import { CardApp } from "@/components/card/card-app";
import { EmbedBoot } from "@/components/layout/embed-gate";

export const metadata: Metadata = {
  title: "Card",
  description: "Check this card and view its mint",
};

/** Hold to Check, Safari NFC tap, or `/card?token=` wallet finish. */
export default function CardPage() {
  return (
    <Suspense fallback={<EmbedBoot />}>
      <CardApp />
    </Suspense>
  );
}
