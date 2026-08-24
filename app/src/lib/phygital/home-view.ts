import { PhygitalTokenType } from "phygital-token-sdk";
import type { Address } from "@solana/kit";

import {
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";

/** Post-tap screens on `/` — object first, wallet only when this vault owns it. */
export type AccessoryTapView =
  | "unsupported"
  | "claim"
  | "signed-out"
  | "foreign-owner"
  | "wallet";

/**
 * Controlled + unclaimed → claim.
 * Controlled + claimed, no passkey session → signed-out (object + sign in).
 * Controlled + claimed by this vault → wallet.
 * Controlled + claimed by someone else → foreign-owner.
 * Bearer (or any other type) is authenticity only.
 */
export function accessoryTapView(
  token: Pick<PhygitalToken, "tokenType" | "currentOwner">,
  vaultPda: Address | null,
): AccessoryTapView {
  if (token.tokenType !== PhygitalTokenType.Controlled) {
    return "unsupported";
  }
  if (isUnclaimedToken(token)) return "claim";
  if (!vaultPda) return "signed-out";
  if (token.currentOwner === vaultPda) return "wallet";
  return "foreign-owner";
}
