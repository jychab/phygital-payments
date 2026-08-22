import { PhygitalTokenType } from "phygital-token-sdk";
import type { Address } from "@solana/kit";

import {
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";

/** Post-tap screens on `/` after LazorKit sign-in. */
export type AccessoryHomeView =
  | "unsupported"
  | "claim"
  | "foreign-owner"
  | "wallet";

/**
 * Controlled + unclaimed → claim.
 * Controlled + claimed by this vault → wallet.
 * Controlled + claimed by someone else → foreign-owner.
 * Bearer (or any other type) is not this route.
 */
export function accessoryHomeView(
  token: Pick<PhygitalToken, "tokenType" | "currentOwner">,
  vaultPda: Address,
): AccessoryHomeView {
  if (token.tokenType !== PhygitalTokenType.Controlled) {
    return "unsupported";
  }
  if (isUnclaimedToken(token)) return "claim";
  if (token.currentOwner === vaultPda) return "wallet";
  return "foreign-owner";
}
