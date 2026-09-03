/**
 * Phantom Shortcuts (v2) — wire + UI helpers.
 * Parsing lives on the API Worker; the app only renders resolved shortcuts.
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

/** `solana:` URIs always open externally; never iframe. */
export function shortcutOpensExternally(shortcut: CollectibleShortcut): boolean {
  if (shortcut.uri.startsWith("solana:")) return true;
  return shortcut.prefersExternalTarget === true;
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
