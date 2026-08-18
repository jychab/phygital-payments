import type { PaySetupStep } from "@/lib/payments/device-setup-state";

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

export function deviceFinishHrefForStep(step: PaySetupStep, owner: string): string {
  return deviceFinishHref({
    intent: step === "enable" ? "verifier" : "limit",
    owner,
  });
}
