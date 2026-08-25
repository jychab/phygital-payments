/** Dashboard deep-link helpers for owned-item browse detail. */

export const DASHBOARD_FROM = "dashboard";

/** True when `/card` or `/accessory` was opened from the owner dashboard. */
export function isDashboardBrowse(
  searchParams: Pick<URLSearchParams, "get">,
): boolean {
  return searchParams.get("from") === DASHBOARD_FROM;
}

/** Browse-detail URL with `from=dashboard` for Back to dashboard. */
export function dashboardDetailHref(
  route: "card" | "accessory",
  tokenAddress: string,
): string {
  const path =
    route === "card"
      ? `/card?address=${encodeURIComponent(tokenAddress)}`
      : `/accessory?address=${encodeURIComponent(tokenAddress)}`;
  return `${path}&from=${DASHBOARD_FROM}`;
}
