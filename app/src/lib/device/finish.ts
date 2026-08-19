/** `/device/finish?owner=&asset=` — continue Pay setup after a tap. */
export function deviceFinishHref(args: { owner: string; asset: string }): string {
  const params = new URLSearchParams({
    owner: args.owner,
    asset: args.asset,
  });
  return `/device/finish?${params.toString()}`;
}
