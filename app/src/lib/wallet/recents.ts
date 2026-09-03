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

function readAll(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is RecentItem =>
        typeof row === "object" &&
        row != null &&
        typeof (row as RecentItem).tokenAddress === "string" &&
        typeof (row as RecentItem).walletAddress === "string",
    );
  } catch {
    return [];
  }
}

function writeAll(items: RecentItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_RECENTS)));
}

export function listRecents(): RecentItem[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertRecent(item: Omit<RecentItem, "updatedAt"> & { updatedAt?: number }) {
  const next: RecentItem = {
    ...item,
    updatedAt: item.updatedAt ?? Date.now(),
  };
  const rest = readAll().filter((r) => r.tokenAddress !== next.tokenAddress);
  writeAll([next, ...rest]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("revibase:recents"));
  }
}
