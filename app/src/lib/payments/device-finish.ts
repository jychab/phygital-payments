export type DeviceFinishIntent = "limit" | "verifier";

/** Wallet finish URL for spending cap or payment verifier (no tap-proof token). */
export function deviceFinishHref(args: {
  intent: DeviceFinishIntent;
  owner: string;
}): string {
  const params = new URLSearchParams({
    intent: args.intent,
    owner: args.owner,
  });
  return `/device/finish?${params.toString()}`;
}

export function absoluteDeviceFinishUrl(args: {
  intent: DeviceFinishIntent;
  owner: string;
  origin?: string;
}): string {
  const origin =
    args.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const path = deviceFinishHref(args);
  return origin ? `${origin}${path}` : path;
}
