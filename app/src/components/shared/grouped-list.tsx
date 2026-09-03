"use client";

import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** iOS Settings / Telegram-style inset grouped list. */
export function GroupedList({
  children,
  className,
  label,
  footer,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  footer?: ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <h2 className="text-section-label px-4">{label}</h2>
      ) : null}
      <ul className="overflow-hidden rounded-2xl bg-grouped text-grouped-foreground">
        {children}
      </ul>
      {footer ? (
        <p className="px-4 text-xs leading-relaxed text-muted-foreground">
          {footer}
        </p>
      ) : null}
    </section>
  );
}

export function GroupedRow({
  children,
  className,
  onClick,
  trailing,
  subtitle,
  destructive,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  subtitle?: ReactNode;
  destructive?: boolean;
}) {
  const rowClass = cn(
    "flex w-full items-center gap-3 px-4 py-3 text-left",
    "min-h-11 transition-colors",
    onClick &&
      "hover:bg-muted/50 active:bg-muted/70 focus-visible:bg-muted/50 focus-visible:outline-none",
    destructive && "text-destructive",
    className,
  );

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{children}</div>
        {subtitle ? (
          <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
        ) : null}
      </div>
      {trailing ??
        (onClick ? (
          <ChevronRight
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
        ) : null)}
    </>
  );

  return (
    <li className="border-b border-border/50 last:border-b-0">
      {onClick ? (
        <button type="button" onClick={onClick} className={rowClass}>
          {body}
        </button>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}
