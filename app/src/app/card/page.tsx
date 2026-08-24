import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AppBoot } from "@/components/layout/app-shell";

const CardApp = dynamic(
  () => import("@/components/card/card-app").then((m) => m.CardApp),
  { loading: () => <AppBoot /> },
);

export const metadata: Metadata = {
  title: "Accessories",
  description: "Check if this accessory is genuine, then claim it to a wallet",
};

export default function CardPage() {
  return (
    <Suspense fallback={<AppBoot />}>
      <CardApp />
    </Suspense>
  );
}
