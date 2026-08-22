import { PhygitalTokenType } from "phygital-token-sdk";
import type { Address } from "@solana/kit";

import {
  isUnclaimedToken,
  type PhygitalToken,
} from "@/lib/phygital/token";

/** Post-tap screens after LazorKit sign-in. */
export type PhygitalTapView =
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
export function phygitalTapView(
  token: Pick<PhygitalToken, "tokenType" | "currentOwner">,
  vaultPda: Address,
): PhygitalTapView {
  if (token.tokenType !== PhygitalTokenType.Controlled) {
    return "unsupported";
  }
  if (isUnclaimedToken(token)) return "claim";
  if (token.currentOwner === vaultPda) return "wallet";
  return "foreign-owner";
}
