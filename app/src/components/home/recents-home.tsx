"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { GroupedList } from "@/components/shared/grouped-list";
import { IdentityChip } from "@/components/shared/identity-chip";
import { copy } from "@/lib/copy/phygital";
import { EMPTY_RECENTS, listRecents } from "@/lib/wallet/recents";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

function subscribe(onStoreChange: () => void) {
  const onFocus = () => onStoreChange();
  const onCustom = () => onStoreChange();
  window.addEventListener("focus", onFocus);
  window.addEventListener("revibase:recents", onCustom);
  return () => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("revibase:recents", onCustom);
  };
}

function getSnapshot() {
  return listRecents();
}

function getServerSnapshot() {
  return EMPTY_RECENTS;
}

/** Device-local Recents hub — no login. */
export function RecentsHome() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const latest = items[0];

  const headerExtra = useMemo(() => {
    if (!latest?.walletAddress) return null;
    return (
      <IdentityChip walletAddress={latest.walletAddress} mode="copy" />
    );
  }, [latest?.walletAddress]);

  return (
    <AppShell layout="compact" headerExtra={headerExtra}>
      <div className="flex flex-1 flex-col gap-5">
        <h1 className={cn("text-large-title", galleryAnimate.rise)}>
          {copy.recents.heading}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
            <p className="text-base font-semibold">{copy.recents.emptyTitle}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {copy.recents.emptyBody}
            </p>
          </div>
        ) : (
          <GroupedList>
            {items.map((item) => (
              <li
                key={item.tokenAddress}
                className="border-b border-border/50 last:border-b-0"
              >
                <Link
                  href={`/token?address=${encodeURIComponent(item.tokenAddress)}`}
                  className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50 active:bg-muted/70 focus-visible:bg-muted/50 focus-visible:outline-none"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-11 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground">
                      {item.kind === "card" ? "C" : "A"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.kind === "card"
                        ? copy.recents.card
                        : copy.recents.accessory}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </GroupedList>
        )}
      </div>
    </AppShell>
  );
}
