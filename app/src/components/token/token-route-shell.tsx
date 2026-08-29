"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import type { ShellLayout } from "@/lib/layout";

/** Chrome for `/token`. */
export function TokenRouteShell({
  children,
  layout = "compact",
}: {
  children?: ReactNode;
  layout?: ShellLayout;
}) {
  return (
    <AppShell walletActions="full" modeLabel="Token" layout={layout}>
      {children}
    </AppShell>
  );
}
