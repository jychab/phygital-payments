"use client";

import { type ReactNode } from "react";

import { AppCard, AppShell } from "@/components/layout/app-shell";

export function AccessoryWalletShell({
  children,
  modeLabel = "Accessory",
}: {
  children: ReactNode;
  modeLabel?: string;
}) {
  return (
    <AppShell modeLabel={modeLabel}>
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}
