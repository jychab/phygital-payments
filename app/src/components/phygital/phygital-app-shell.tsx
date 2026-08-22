"use client";

import { type ReactNode } from "react";

import { AppCard, AppShell } from "@/components/layout/app-shell";

export function PhygitalAppShell({
  children,
  modeLabel = "Phygital",
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
