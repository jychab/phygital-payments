"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CenteredStatus({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-14 text-center">
      {children}
    </div>
  );
}

export function SuccessStatus({
  icon,
  title,
  body,
  bodyClassName = "max-w-72",
}: {
  icon: ReactNode;
  title: string;
  body: string;
  bodyClassName?: string;
}) {
  return (
    <CenteredStatus>
      <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
        {icon}
      </div>
      <p className="text-base font-medium text-foreground">{title}</p>
      <p className={cn("mx-auto text-sm text-muted-foreground", bodyClassName)}>
        {body}
      </p>
    </CenteredStatus>
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
  body?: ReactNode;
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
