"use client";

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { GateMessage } from "@/components/layout/gate-message";
import { brand } from "@/lib/copy/phygital";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Full-page error for invalid iframe embeds (missing/invalid recipient, etc.). */
export function EmbedError({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <AppShell walletActions="hidden" layout="compact">
      <GateMessage
        icon={<AlertCircle className="size-5 text-destructive" />}
        title={title}
        body={body}
        destructive
      />
    </AppShell>
  );
}

export function EmbedBoot({ children }: { children?: ReactNode }) {
  return (
    <AppShell walletActions="hidden" layout="compact">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-14">
        <div
          className={cn(
            "h-2 w-24 rounded-full bg-linear-to-r from-muted/30 via-muted/60 to-muted/30 bg-size-[200%_100%]",
            galleryAnimate.shimmer,
          )}
          aria-hidden
        />
        <p className="font-(family-name:--font-display) text-sm tracking-tight text-muted-foreground">
          {brand.company}
        </p>
      </div>
      {children}
    </AppShell>
  );
}
