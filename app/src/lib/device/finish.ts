/** `/device?token=` — pending claim (same-tab or wallet in-app browser). */
export function deviceClaimHref(token: string): string {
  return `/device?token=${encodeURIComponent(token)}`;
}
