/** Collection hub deep-link helpers for owned-item detail. */

/** Token detail URL from the Collection hub. */
export function collectionDetailHref(tokenAddress: string): string {
  return `/token?address=${encodeURIComponent(tokenAddress)}`;
}
