import type { Metadata } from "next";
import { Suspense } from "react";

import { OwnedHome } from "@/components/home/owned-home";
import { LoadingStatus } from "@/components/shared/loading-status";
import { AppShell } from "@/components/layout/app-shell";
import { products } from "@/lib/copy/phygital";

export const metadata: Metadata = {
  title: products.home.name,
  description: products.home.tagline,
};

export default function Home() {
  return (
    <Suspense
      fallback={
        <AppShell layout="home">
          <LoadingStatus />
        </AppShell>
      }
    >
      <OwnedHome />
    </Suspense>
  );
}
