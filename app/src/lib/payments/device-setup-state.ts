import { hasStoredPayApiKey } from "@/lib/payments/pay-key-store";

export type PaySetupSnapshot = {
  capSet: boolean;
  verifierSet: boolean;
};

export type PaySetupStep = "limit" | "enable";

/** Server-side Pay configured (spending limit + verifier issued). */
export function isPayConfigured(s: PaySetupSnapshot): boolean {
  return s.capSet && s.verifierSet;
}

export function nextPaySetupStep(
  s: PaySetupSnapshot,
): PaySetupStep | null {
  if (!s.capSet) return "limit";
  if (!s.verifierSet) return "enable";
  return null;
}

/** This phone has a stored payment key for `wallet`. */
export function hasLocalPayKey(wallet: string): boolean {
  return hasStoredPayApiKey(wallet);
}
