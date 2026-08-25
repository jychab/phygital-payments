/** Collection hub deep-link helpers for owned-item detail. */

/** URL `from=` value when opening `/card` or `/accessory` from Collection. */
export const COLLECTION_FROM = "collection";

/** True when `/card` or `/accessory` was opened from the Collection hub.
 * Navigation hint only — Confirmed still requires owner wallet match
 * (`CollectionVerifiedSeed`). */
export function isFromCollection(
  searchParams: Pick<URLSearchParams, "get">,
): boolean {
  return searchParams.get("from") === COLLECTION_FROM;
}

/** Collection detail URL with `from=collection` for Back + verified seed. */
export function collectionDetailHref(
  route: "card" | "accessory",
  tokenAddress: string,
): string {
  const path =
    route === "card"
      ? `/card?address=${encodeURIComponent(tokenAddress)}`
      : `/accessory?address=${encodeURIComponent(tokenAddress)}`;
  return `${path}&from=${COLLECTION_FROM}`;
}
