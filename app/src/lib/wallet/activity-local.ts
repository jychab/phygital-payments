"use client";

import type { WalletActivityItem } from "@/lib/wallet/portfolio-types";
import { createFilteredSnapshot, createLocalStore } from "@/lib/local-store";

const MAX_ITEMS = 48;
const EMPTY_ACTIVITY: WalletActivityItem[] = [];

function parseActivity(raw: string | null): WalletActivityItem[] {
  if (!raw) return EMPTY_ACTIVITY;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_ACTIVITY;
    return parsed
      .filter((row): row is WalletActivityItem => {
        if (!row || typeof row !== "object") return false;
        const item = row as Partial<WalletActivityItem>;
        return (
          typeof item.id === "string" &&
          typeof item.walletAddress === "string" &&
          typeof item.kind === "string" &&
          typeof item.title === "string" &&
          typeof item.source === "string"
        );
      })
      .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
      .slice(0, MAX_ITEMS);
  } catch (e) {
    console.warn("[activity-local] Failed to parse stored activity", e);
    return EMPTY_ACTIVITY;
  }
}

const activityStore = createLocalStore<WalletActivityItem>({
  storageKey: "revibase.wallet-activity.v1",
  eventName: "revibase:wallet-activity",
  maxItems: MAX_ITEMS,
  empty: EMPTY_ACTIVITY,
  label: "activity-local",
  parse: parseActivity,
});

const walletSnapshot = createFilteredSnapshot(activityStore, (items, wallet) =>
  items.filter((item) => item.walletAddress === wallet),
);

function writeActivity(items: WalletActivityItem[]) {
  activityStore.write(items);
  walletSnapshot.invalidate();
}

export function listLocalWalletActivity(walletAddress: string | null): WalletActivityItem[] {
  return walletSnapshot.get(walletAddress) as WalletActivityItem[];
}

export function subscribeLocalWalletActivity(onStoreChange: () => void): () => void {
  return activityStore.subscribe(() => {
    walletSnapshot.invalidate();
    onStoreChange();
  });
}

export function pushLocalWalletActivity(item: WalletActivityItem) {
  const rest = activityStore.list().filter((existing) => existing.id !== item.id);
  writeActivity([item, ...rest]);
}
