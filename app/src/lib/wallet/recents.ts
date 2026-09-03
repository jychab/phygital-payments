/**
 * Device-local Recents — last-tapped cards and accessories (no login).
 */

import { createLocalStore } from "@/lib/local-store";

export type RecentKind = "card" | "accessory";

export type RecentItem = {
  tokenAddress: string;
  walletAddress: string;
  kind: RecentKind;
  label: string;
  /** Linked mint when this is a card; used for DAS art. */
  mint?: string | null;
  imageUrl?: string | null;
  /** Passkey pubkey for re-hold matching when the session cookie expires. */
  secp256r1PublicKey?: string | null;
  updatedAt: number;
};

const MAX_RECENTS = 24;

/** Stable empty list for SSR / useSyncExternalStore. */
export const EMPTY_RECENTS: RecentItem[] = [];

function parseItems(raw: string | null): RecentItem[] {
  if (!raw) return EMPTY_RECENTS;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_RECENTS;
    const items = parsed.filter(
      (row): row is RecentItem =>
        typeof row === "object" &&
        row != null &&
        typeof (row as RecentItem).tokenAddress === "string" &&
        typeof (row as RecentItem).walletAddress === "string",
    );
    if (items.length === 0) return EMPTY_RECENTS;
    return items.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_RECENTS);
  } catch (e) {
    console.warn("[recents] Failed to parse stored recents", e);
    return EMPTY_RECENTS;
  }
}

export const recentsStore = createLocalStore<RecentItem>({
  storageKey: "revibase.recents.v1",
  eventName: "revibase:recents",
  maxItems: MAX_RECENTS,
  empty: EMPTY_RECENTS,
  label: "recents",
  parse: parseItems,
});

/** Cached snapshot — same reference until localStorage contents change. */
export function listRecents(): RecentItem[] {
  return recentsStore.list() as RecentItem[];
}

export function subscribeRecents(onStoreChange: () => void): () => void {
  return recentsStore.subscribe(onStoreChange);
}

export function upsertRecent(
  item: Omit<RecentItem, "updatedAt"> & { updatedAt?: number },
) {
  const next: RecentItem = {
    ...item,
    updatedAt: item.updatedAt ?? Date.now(),
  };
  const rest = listRecents().filter((r) => r.tokenAddress !== next.tokenAddress);
  recentsStore.write([next, ...rest]);
}
