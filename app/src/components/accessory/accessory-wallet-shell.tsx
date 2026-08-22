"use client";

import { type ReactNode } from "react";

import { AppCard, AppShell } from "@/components/layout/app-shell";

/** Chrome for `/` and `/cards`. Authenticity and claim skip loading a passkey until needed. */
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
