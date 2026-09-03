/**
 * Device-local Recents — last-tapped cards and accessories (no login).
 */

export type RecentKind = "card" | "accessory";

export type RecentItem = {
  tokenAddress: string;
  walletAddress: string;
  kind: RecentKind;
  label: string;
  imageUrl?: string | null;
  updatedAt: number;
};

const STORAGE_KEY = "revibase.recents.v1";
const MAX_RECENTS = 24;

/** Stable empty list for SSR / useSyncExternalStore. */
export const EMPTY_RECENTS: RecentItem[] = [];

let cachedRaw: string | null | undefined;
let cachedItems: RecentItem[] = EMPTY_RECENTS;

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
    return items.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return EMPTY_RECENTS;
  }
}

function writeAll(items: RecentItem[]) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(items.slice(0, MAX_RECENTS));
  window.localStorage.setItem(STORAGE_KEY, raw);
  cachedRaw = raw;
  cachedItems = parseItems(raw);
}

/** Cached snapshot — same reference until localStorage contents change. */
export function listRecents(): RecentItem[] {
  if (typeof window === "undefined") return EMPTY_RECENTS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === cachedRaw) return cachedItems;
  cachedRaw = raw;
  cachedItems = parseItems(raw);
  return cachedItems;
}

export function upsertRecent(item: Omit<RecentItem, "updatedAt"> & { updatedAt?: number }) {
  const next: RecentItem = {
    ...item,
    updatedAt: item.updatedAt ?? Date.now(),
  };
  const rest = listRecents().filter((r) => r.tokenAddress !== next.tokenAddress);
  writeAll([next, ...rest]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("revibase:recents"));
  }
}
