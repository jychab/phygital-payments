/** `/device/finish?intent=limit|enable&owner=` — continue Pay setup after a tap. */
export function deviceFinishHref(args: {
  intent: "limit" | "enable";
  owner: string;
}): string {
  const params = new URLSearchParams({
    intent: args.intent,
    owner: args.owner,
  });
  return `/device/finish?${params.toString()}`;
}
