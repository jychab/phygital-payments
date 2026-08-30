/**
 * Phantom Shortcuts (v2) — curated links from `{external_url}/shortcuts.json`.
 * @see https://github.com/phantom/shortcuts
 */

export type CollectibleShortcut = {
  label: string;
  uri: string;
  icon?: string | null;
};

type RawShortcut = {
  label?: string;
  uri?: string;
  icon?: string;
  type?: string;
  platform?: string;
  limitToCollections?: string[];
};

type RawShortcutsDoc = {
  version?: number;
  shortcuts?: RawShortcut[];
};

const FETCH_TIMEOUT_MS = 4_000;

/** Build shortcuts.json URL from an NFT external_url (path-aware). */
export function shortcutsJsonUrl(externalUrl: string): string | null {
  const trimmed = externalUrl.trim();
  if (!trimmed.startsWith("https://")) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    const base = url.href.replace(/\/?$/, "");
    return `${base}/shortcuts.json`;
  } catch {
    return null;
  }
}

function isAllowedUri(uri: string): boolean {
  try {
    const u = new URL(uri);
    return u.protocol === "https:" || u.protocol === "solana:";
  } catch {
    return false;
  }
}

/**
 * Parse and filter Phantom shortcuts for a collectible detail page.
 * Prefer mobile/all platforms; collectible (or omitted) type only.
 */
export function parseCollectibleShortcuts(
  doc: unknown,
  collectionMint: string | null,
): CollectibleShortcut[] {
  if (!doc || typeof doc !== "object") return [];
  const shortcuts = (doc as RawShortcutsDoc).shortcuts;
  if (!Array.isArray(shortcuts)) return [];

  const out: CollectibleShortcut[] = [];
  for (const raw of shortcuts) {
    const label = raw.label?.trim();
    const uri = raw.uri?.trim();
    if (!label || !uri || !isAllowedUri(uri)) continue;

    const type = raw.type?.trim().toLowerCase();
    if (type && type !== "collectible") continue;

    const platform = raw.platform?.trim().toLowerCase() || "all";
    if (platform !== "all" && platform !== "mobile") continue;

    const limits = raw.limitToCollections;
    if (Array.isArray(limits) && limits.length > 0) {
      if (!collectionMint || !limits.includes(collectionMint)) continue;
    }

    out.push({
      label,
      uri,
      icon: raw.icon?.trim() || null,
    });
  }
  return out;
}

/** Server-side fetch of shortcuts.json — returns [] on any failure. */
export async function fetchCollectibleShortcuts(
  externalUrl: string,
  collectionMint: string | null,
): Promise<CollectibleShortcut[]> {
  const jsonUrl = shortcutsJsonUrl(externalUrl);
  if (!jsonUrl) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(jsonUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      redirect: "follow",
      // Avoid caching bad responses forever in the edge isolate.
      cache: "no-store",
    });
    if (!res.ok) return [];
    const contentType = res.headers.get("content-type") ?? "";
    if (
      contentType &&
      !contentType.includes("application/json") &&
      !contentType.includes("text/plain") &&
      !contentType.includes("text/json")
    ) {
      return [];
    }
    const body: unknown = await res.json();
    return parseCollectibleShortcuts(body, collectionMint);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
