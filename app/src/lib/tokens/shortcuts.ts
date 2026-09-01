/**
 * Phantom Shortcuts (v2) — curated links from `{external_url}/shortcuts.json`.
 * @see https://github.com/phantom/shortcuts
 */

export type CollectibleShortcut = {
  label: string;
  uri: string;
  icon?: string | null;
  /** Revibase extension — promote to sticky primary when token verified. */
  primaryCta?: boolean;
  /** Phantom v2 — `true` = external popup; `false`/omitted = in-app iframe sheet. */
  prefersExternalTarget?: boolean;
};

export type ShortcutUriContext = {
  tokenId?: string | null;
  ownerAddress?: string | null;
  collectionId?: string | null;
};

type RawShortcut = {
  label?: string;
  uri?: string;
  icon?: string;
  type?: string;
  platform?: string;
  limitToCollections?: string[];
  primaryCta?: boolean;
  prefersExternalTarget?: boolean;
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

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Registrable root domain (last two labels) for iframe allowlist checks. */
export function rootDomainOf(url: string): string | null {
  const host = hostnameOf(url);
  if (!host) return null;
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;
  return parts.slice(-2).join(".");
}

/** True when two https URLs share the same root domain (e.g. app.example.com + example.com). */
export function sharesRootDomain(a: string, b: string): boolean {
  const left = rootDomainOf(a);
  const right = rootDomainOf(b);
  return Boolean(left && right && left === right);
}

/** `solana:` URIs always open externally; never iframe. */
export function shortcutOpensExternally(shortcut: CollectibleShortcut): boolean {
  if (shortcut.uri.startsWith("solana:")) return true;
  return shortcut.prefersExternalTarget === true;
}

/**
 * Phantom rule: only `prefersExternalTarget` links may leave the token's
 * `external_url` site. When false, URI must share root domain with external_url.
 */
export function isShortcutUriAllowed(
  uri: string,
  externalUrl: string | null,
  prefersExternalTarget: boolean,
): boolean {
  if (!isAllowedUri(uri)) return false;
  if (uri.startsWith("solana:")) return true;
  if (prefersExternalTarget) return true;
  if (!externalUrl) return true;
  return sharesRootDomain(uri, externalUrl);
}

/** Substitute Phantom placeholder variables in shortcut URIs. */
export function resolveShortcutUri(
  uri: string,
  ctx: ShortcutUriContext,
): string {
  return uri
    .replaceAll("{{tokenId}}", ctx.tokenId ?? "")
    .replaceAll("{{ownerAddress}}", ctx.ownerAddress ?? "")
    .replaceAll("{{collectionId}}", ctx.collectionId ?? "");
}

/** First shortcut marked `primaryCta: true`, else null. */
export function pickPrimaryCtaShortcut(
  shortcuts: CollectibleShortcut[],
): CollectibleShortcut | null {
  return shortcuts.find((s) => s.primaryCta === true) ?? null;
}

/** Chip list — exclude the promoted primary CTA to avoid duplication. */
export function filterShortcutChips(
  shortcuts: CollectibleShortcut[],
  primary: CollectibleShortcut | null,
): CollectibleShortcut[] {
  if (!primary) return shortcuts;
  return shortcuts.filter(
    (s) => s.label !== primary.label || s.uri !== primary.uri,
  );
}

/**
 * Parse and filter Phantom shortcuts for a collectible detail page.
 * Prefer mobile/all platforms; collectible (or omitted) type only.
 */
export function parseCollectibleShortcuts(
  doc: unknown,
  collectionMint: string | null,
  externalUrl: string | null = null,
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

    const prefersExternalTarget =
      uri.startsWith("solana:") || raw.prefersExternalTarget === true;

    if (
      !isShortcutUriAllowed(uri, externalUrl, prefersExternalTarget)
    ) {
      continue;
    }

    const entry: CollectibleShortcut = {
      label,
      uri,
      icon: raw.icon?.trim() || null,
      prefersExternalTarget,
    };
    if (raw.primaryCta === true) {
      entry.primaryCta = true;
    }
    out.push(entry);
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
    return parseCollectibleShortcuts(body, collectionMint, externalUrl);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
