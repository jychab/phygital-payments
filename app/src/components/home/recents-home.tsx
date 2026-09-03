"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { copy } from "@/lib/copy/phygital";
import { listRecents, type RecentItem } from "@/lib/wallet/recents";
import { shortAddress } from "@/lib/utils";

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

function getSnapshot(): RecentItem[] {
  return listRecents();
}

function getServerSnapshot(): RecentItem[] {
  return [];
}

/** Device-local Recents hub — no login. */
export function RecentsHome() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <AppShell layout="compact">
      <div className="flex flex-1 flex-col gap-6">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          {copy.recents.heading}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
            <p className="text-base font-medium">{copy.recents.emptyTitle}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {copy.recents.emptyBody}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => (
              <li key={item.tokenAddress}>
                <Link
                  href={`/token?address=${encodeURIComponent(item.tokenAddress)}`}
                  className="flex items-center gap-3 rounded-2xl bg-muted/25 px-3 py-3 transition-colors hover:bg-muted/40"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-11 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-xs text-muted-foreground">
                      {item.kind === "card" ? "C" : "A"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.kind === "card"
                        ? copy.recents.card
                        : copy.recents.accessory}{" "}
                      · {shortAddress(item.walletAddress, 4)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
