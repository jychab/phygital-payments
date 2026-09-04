"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useShellStageSlot } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

export type NavBarSlots = {
  leading?: ReactNode;
  title?: ReactNode;
  trailing?: ReactNode;
};

/** Single chrome row — leading · centered title · trailing. */
function NavBarFrame({
  leading,
  title,
  trailing,
  className,
}: NavBarSlots & { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-h-11 items-center justify-between gap-2",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center justify-start">
        {leading ?? <span className="w-11" aria-hidden />}
      </div>
      {title != null ? (
        <div className="pointer-events-none absolute left-1/2 max-w-[50%] -translate-x-1/2 truncate text-center text-sm font-semibold tracking-tight">
          {title}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
        {trailing ?? <span className="w-11" aria-hidden />}
      </div>
    </div>
  );
}

/**
 * Page nav. Inside {@link AppShell}, portals into the shell header and hides
 * the brand row — one chrome line. Outside the shell, renders inline.
 */
export function NavBar({
  leading,
  title,
  trailing,
  className,
}: NavBarSlots & { className?: string }) {
  const stage = useShellStageSlot();
  const mount = stage?.mount ?? null;
  const setActive = stage?.setActive;
  const inShell = Boolean(stage);

  useLayoutEffect(() => {
    if (!setActive) return;
    setActive(true);
    return () => setActive(false);
  }, [setActive]);

  const frame = (
    <NavBarFrame
      leading={leading}
      title={title}
      trailing={trailing}
      className={cn(!inShell && "mb-3", className)}
    />
  );

  if (inShell) {
    if (!mount) return null;
    return createPortal(frame, mount);
  }

  return frame;
}
