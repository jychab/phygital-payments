/** Collection hub deep-link helpers for owned-item detail. */

/** URL `from=` value when opening `/token` from Collection. */
export const COLLECTION_FROM = "collection";

/** True when `/token` was opened from the Collection hub.
 * Navigation hint only — Confirmed still requires owner wallet match
 * (`CollectionVerifiedSeed`). */
export function isFromCollection(
  searchParams: Pick<URLSearchParams, "get">,
): boolean {
  return searchParams.get("from") === COLLECTION_FROM;
}

/** Collection detail URL with `from=collection` for Back + verified seed. */
export function collectionDetailHref(tokenAddress: string): string {
  return `/token?address=${encodeURIComponent(tokenAddress)}&from=${COLLECTION_FROM}`;
}
