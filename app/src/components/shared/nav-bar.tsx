"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Compact iOS/Telegram-style nav: leading · title · trailing. */
export function NavBar({
  leading,
  title,
  trailing,
  className,
}: {
  leading?: ReactNode;
  title?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-3 flex min-h-11 items-center justify-between gap-2",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-start">
        {leading ?? <span className="w-11" aria-hidden />}
      </div>
      {title != null ? (
        <div className="max-w-[50%] shrink truncate text-center text-sm font-semibold tracking-tight">
          {title}
        </div>
      ) : (
        <div className="w-0 shrink" aria-hidden />
      )}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        {trailing ?? <span className="w-11" aria-hidden />}
      </div>
    </div>
  );
}
