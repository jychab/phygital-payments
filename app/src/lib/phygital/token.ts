import { address, type Address, type Rpc, type SolanaRpcApi } from "@solana/kit";
import {
  fetchAllTokensFromOwner,
  fetchPhygitalToken as fetchPhygitalTokenAccount,
  fetchTokenByIdentifier,
  findTokenPda,
  parseSecp256r1Pubkey,
  PhygitalTokenType,
  type PhygitalToken as PhygitalTokenAccount,
} from "phygital-token-sdk";

import { bytesToBase64Url } from "@/lib/crypto/base64";

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

export function phygitalTokenFromAccount(
  tokenAddress: Address,
  account: PhygitalTokenAccount,
): PhygitalToken {
  return {
    tokenType: account.tokenType,
    identifier: bytesToBase64Url(new Uint8Array(account.identifier[0])),
    secp256r1PublicKey: bytesToBase64Url(new Uint8Array(account.publicKey[0])),
    address: tokenAddress,
    isLocked: account.isLocked,
    currentOwner: account.owner,
    lastSignCount: account.lastSignCount,
    mint: account.mint,
  };
}

/** Load token by on-chain PDA. */
export async function fetchPhygitalToken(
  rpc: Rpc<SolanaRpcApi>,
  tokenAddress: Address,
): Promise<PhygitalToken> {
  const { data } = await fetchPhygitalTokenAccount(rpc, tokenAddress);
  return phygitalTokenFromAccount(tokenAddress, data);
}

/**
 * Load token by passkey public key (WebAuthn `verifyResponse` result).
 * PDA is seeded by the passkey, not the chip identifier.
 */
export async function fetchPhygitalTokenByPasskey(
  rpc: Rpc<SolanaRpcApi>,
  secp256r1PublicKey: string,
): Promise<PhygitalToken> {
  const tokenAddress = await findTokenPda(
    parseSecp256r1Pubkey(secp256r1PublicKey),
  );
  return fetchPhygitalToken(rpc, tokenAddress);
}

/**
 * Load token by chip `identifier` (NFC URL `pk`), not by passkey.
 * PDA is still derived from on-chain `publicKey` after the GPA lookup.
 */
export async function fetchPhygitalTokenByIdentifier(
  rpc: Rpc<SolanaRpcApi>,
  identifier: string,
): Promise<PhygitalToken> {
  const account = await fetchTokenByIdentifier(rpc, identifier);
  if (!account) {
    throw new Error("Token not found for identifier");
  }
  const tokenAddress = await findTokenPda(account.publicKey);
  return phygitalTokenFromAccount(tokenAddress, account);
}

/** All phygital tokens whose on-chain `owner` matches `owner`. */
export async function fetchPhygitalTokensByOwner(
  rpc: Rpc<SolanaRpcApi>,
  owner: Address,
): Promise<PhygitalToken[]> {
  const accounts = await fetchAllTokensFromOwner(owner, rpc);
  return Promise.all(
    accounts.map(async (account) => {
      const tokenAddress = await findTokenPda(account.publicKey);
      return phygitalTokenFromAccount(tokenAddress, account);
    }),
  );
}

/** True when no wallet has claimed the token yet. */
export function isUnclaimedToken(
  token: Pick<PhygitalToken, "currentOwner">,
): boolean {
  return token.currentOwner === DEFAULT_TOKEN_OWNER;
}

/** Controlled devices can open Pay (spending limit / Hold to Pay). */
export function tokenAllowsPay(
  token: Pick<PhygitalToken, "tokenType">,
): boolean {
  return token.tokenType === PhygitalTokenType.Controlled;
}
