import type { Metadata } from "next";
import { Suspense } from "react";

import { RouteBoot } from "@/components/layout/route-boot";
import { TokenApp } from "@/components/token/token-app";

export const metadata: Metadata = {
  title: "Token",
  description: "Check this phygital token",
};

/** Hold to Check, Safari NFC tap, authenticity, claim, and Pay when eligible. */
export default function TokenPage() {
  return (
    <Suspense fallback={<RouteBoot />}>
      <TokenApp />
    </Suspense>
  );
}
