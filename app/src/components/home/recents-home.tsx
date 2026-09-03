"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { GroupedList } from "@/components/shared/grouped-list";
import { copy } from "@/lib/copy/phygital";
import { queryKeys, queryOptions } from "@/lib/queries";
import { fetchDasCollectiblesClient } from "@/lib/tokens/das-collectible-client";
import { galleryAnimate } from "@/lib/motion";
import { cn, shortAddress } from "@/lib/utils";
import {
  EMPTY_RECENTS,
  listRecents,
  type RecentItem,
} from "@/lib/wallet/recents";
import { tokenHomeHref } from "@/lib/wallet/token-session";

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

/** Device-local Recents hub — opens `/token?address=` (session-gated). */
export function RecentsHome() {
  const router = useRouter();
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mintsNeedingDas = useMemo(
    () =>
      [
        ...new Set(
          items
            .filter((item) => item.mint?.trim() && !item.imageUrl)
            .map((item) => item.mint!.trim()),
        ),
      ].sort(),
    [items],
  );
  const queryClient = useQueryClient();
  const dasBatch = useQuery({
    queryKey: queryKeys.dasCollectible.batch(mintsNeedingDas),
    queryFn: async () => {
      const batch = await fetchDasCollectiblesClient(mintsNeedingDas);
      for (const [mint, collectible] of Object.entries(batch)) {
        queryClient.setQueryData(
          queryKeys.dasCollectible.byMint(mint),
          collectible,
        );
      }
      return batch;
    },
    enabled: mintsNeedingDas.length > 0,
    ...queryOptions.stable,
  });

  return (
    <AppShell layout="compact">
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
                <RecentRow
                  item={item}
                  das={
                    item.mint?.trim()
                      ? (dasBatch.data?.[item.mint.trim()] ?? null)
                      : null
                  }
                  onOpen={() =>
                    router.push(tokenHomeHref(item.tokenAddress))
                  }
                />
              </li>
            ))}
          </GroupedList>
        )}
      </div>
    </AppShell>
  );
}

function RecentRow({
  item,
  das,
  onOpen,
}: {
  item: RecentItem;
  das: { image: string | null; name: string } | null;
  onOpen: () => void;
}) {
  const imageUrl = das?.image ?? item.imageUrl ?? null;
  const label = das?.name ?? item.label;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted/70 focus-visible:bg-muted/50 focus-visible:outline-none"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="size-11 rounded-xl object-cover"
        />
      ) : (
        <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground">
          {item.kind === "card" ? "C" : "A"}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs tabular-nums text-muted-foreground">
          {shortAddress(item.walletAddress, 4)}
        </p>
      </div>
    </button>
  );
}
