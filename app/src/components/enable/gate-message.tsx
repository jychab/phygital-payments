"use client";

import type { ReactNode } from "react";

export function CenteredStatus({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center">
      {children}
    </div>
  );
}

export function GateMessage({
  icon,
  title,
  body,
  destructive = false,
  action,
}: {
  icon: ReactNode;
  title: string;
  body?: string;
  destructive?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-14 text-center">
      <div
        className={
          destructive
            ? "flex size-11 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10"
            : "flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40"
        }
      >
        {icon}
      </div>
      <div className="max-w-64 space-y-1.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {body ? (
          <p className="text-sm text-muted-foreground">{body}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
