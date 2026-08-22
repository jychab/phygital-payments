"use client";

import { type ReactNode } from "react";

import { AppCard, AppShell } from "@/components/layout/app-shell";

/** Chrome for `/accessory`. Authenticity and claim skip loading a passkey until needed. */
export function AccessoryWalletShell({ children }: { children: ReactNode }) {
  return (
    <AppShell modeLabel="Accessory">
      <AppCard>{children}</AppCard>
    </AppShell>
  );
}
