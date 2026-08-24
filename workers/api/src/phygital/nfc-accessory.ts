import { PhygitalTokenType } from "phygital-token-sdk";
import type { Address } from "@solana/kit";

import type { PhygitalToken } from "@/phygital/token";

/** Controlled token claimed to this vault (locked or not). */
export function isOwnedNfcAccessory(
  token: Pick<PhygitalToken, "tokenType" | "currentOwner">,
  vaultPda: Address | string,
): boolean {
  return (
    token.tokenType === PhygitalTokenType.Controlled &&
    String(token.currentOwner) === String(vaultPda)
  );
}

/**
 * Ready for tap-to-pay: Controlled + locked + owned by the vault.
 * Lock is applied when spending is enabled, not as a separate user step.
 */
export function isEligibleNfcAccessory(
  token: Pick<PhygitalToken, "tokenType" | "isLocked" | "currentOwner">,
  vaultPda: Address | string,
): boolean {
  return isOwnedNfcAccessory(token, vaultPda) && token.isLocked;
}
