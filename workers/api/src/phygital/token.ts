import { address, type Address, type Rpc, type SolanaRpcApi } from "@solana/kit";
import {
  fetchAllMaybePhygitalToken,
  fetchMaybePhygitalToken,
  fetchTokenByIdentifier,
  findTokenPda,
  parseSecp256r1Pubkey,
  PhygitalTokenType,
  type PhygitalToken as PhygitalTokenAccount,
} from "phygital-token-sdk";

import { bytesToBase64Url } from "@/shared/base64";

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
    address: tokenAddress,
    secp256r1PublicKey: bytesToBase64Url(new Uint8Array(account.publicKey[0])),
    isLocked: account.isLocked,
    currentOwner: account.owner,
    lastSignCount: account.lastSignCount,
    mint: account.mint,
  };
}

/**
 * Load token by passkey public key (WebAuthn `verifyResponse` result).
 * PDA is seeded by the passkey, not the chip identifier. `null` when the
 * account does not exist yet.
 */
export async function fetchMaybePhygitalTokenByPasskey(
  rpc: Rpc<SolanaRpcApi>,
  secp256r1PublicKey: string,
): Promise<PhygitalToken | null> {
  const tokenAddress = await findTokenPda(
    parseSecp256r1Pubkey(secp256r1PublicKey),
  );
  const account = await fetchMaybePhygitalToken(rpc, tokenAddress);
  if (!account.exists) return null;
  return phygitalTokenFromAccount(tokenAddress, account.data);
}

const GMA_CHUNK = 100;

/**
 * Batch load tokens by passkey. One `getMultipleAccounts` per chunk of 100.
 * Missing accounts map to `null`.
 */
export async function fetchMaybePhygitalTokensByPasskeys(
  rpc: Rpc<SolanaRpcApi>,
  secp256r1PublicKeys: readonly string[],
): Promise<Map<string, PhygitalToken | null>> {
  const unique = [...new Set(secp256r1PublicKeys)];
  const result = new Map<string, PhygitalToken | null>();
  if (unique.length === 0) return result;

  const pdas = await Promise.all(
    unique.map((pk) => findTokenPda(parseSecp256r1Pubkey(pk))),
  );

  const chunks: Array<Promise<void>> = [];
  for (let offset = 0; offset < unique.length; offset += GMA_CHUNK) {
    const pkChunk = unique.slice(offset, offset + GMA_CHUNK);
    const pdaChunk = pdas.slice(offset, offset + GMA_CHUNK);
    chunks.push(
      (async () => {
        const accounts = await fetchAllMaybePhygitalToken(rpc, pdaChunk);
        pkChunk.forEach((pk, index) => {
          const account = accounts[index]!;
          const tokenAddress = pdaChunk[index]!;
          result.set(
            pk,
            account.exists
              ? phygitalTokenFromAccount(tokenAddress, account.data)
              : null,
          );
        });
      })(),
    );
  }
  await Promise.all(chunks);
  return result;
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

/** True when no wallet has claimed the token yet. */
export function isUnclaimedToken(
  token: Pick<PhygitalToken, "currentOwner">,
): boolean {
  return token.currentOwner === DEFAULT_TOKEN_OWNER;
}
