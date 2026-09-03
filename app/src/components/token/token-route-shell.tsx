"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import type { ShellLayout } from "@/lib/layout";

/** Chrome for `/token` — identity chip lives in page content. */
export function TokenRouteShell({
  children,
  layout = "compact",
}: {
  children?: ReactNode;
  layout?: ShellLayout;
}) {
  return (
    <AppShell layout={layout} showWordmark>
      {children}
    </AppShell>
  );
}
