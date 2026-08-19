/** `/device?token=` — pending claim (same-tab or wallet in-app browser). */
export function deviceClaimHref(token: string): string {
  return `/device?token=${encodeURIComponent(token)}`;
}

/** `/device?owner=&asset=` — continue Pay setup after a tap. */
export function devicePaySetupHref(args: {
  owner: string;
  asset: string;
}): string {
  const params = new URLSearchParams({
    owner: args.owner,
    asset: args.asset,
  });
  return `/device?${params.toString()}`;
}
