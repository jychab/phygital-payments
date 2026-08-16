"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { AppCard, AppShell } from "@/components/app-shell";
import { GateMessage } from "@/components/gate-message";

/** Full-page error for invalid iframe embeds (missing/invalid recipient, etc.). */
export function EmbedError({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <AppShell walletActions="hidden">
      <AppCard>
        <GateMessage
          icon={<AlertCircle className="size-5 text-destructive" />}
          title={title}
          body={body}
          destructive
        />
      </AppCard>
    </AppShell>
  );
}

export function EmbedBoot({ children }: { children?: ReactNode }) {
  return (
    <AppShell walletActions="hidden">
      <AppCard>
        <div className="flex flex-1 flex-col items-center justify-center py-14" />
        {children}
      </AppCard>
    </AppShell>
  );
}
