import { address, type Address } from "@solana/kit";
import { PhygitalTokenType } from "phygital-token-sdk";

/** System program / default pubkey — token.owner before first claim. */
export const DEFAULT_TOKEN_OWNER = address(
  "11111111111111111111111111111111",
);

/** Lean view of an on-chain phygital token (ownership-only). */
export type PhygitalToken = {
  tokenType: PhygitalTokenType;
  identifier: string;
  secp256r1PublicKey: string;
  /** On-chain token PDA. */
  address: Address;
  isLocked: boolean;
  currentOwner: Address;
  lastSignCount: number;
  mint: Address;
};

/** True when no wallet has claimed the token yet. */
export function isUnclaimedToken(
  token: Pick<PhygitalToken, "currentOwner">,
): boolean {
  return token.currentOwner === DEFAULT_TOKEN_OWNER;
}

/**
 * True when on-chain `mint` is set (not `Pubkey::default()` / system program).
 * Unset mint is the same sentinel as unclaimed `owner`.
 */
export function tokenHasLinkedMint(
  token: Pick<PhygitalToken, "mint">,
): boolean {
  return token.mint !== DEFAULT_TOKEN_OWNER;
}
