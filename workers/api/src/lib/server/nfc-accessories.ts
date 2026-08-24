import { address } from "@solana/kit";
import {
  fetchAllTokensFromOwner,
  findTokenPda,
} from "phygital-token-sdk";

import { isOwnedNfcAccessory } from "@/lib/phygital/nfc-accessory";
import { phygitalTokenFromAccount } from "@/lib/phygital/token";
import { toPhygitalTokenWire, type PhygitalTokenWire } from "@/lib/phygital/token-wire";
import { getSolanaRpc } from "@/lib/solana/rpc";

/** Owned Controlled accessories (locked or not) for the wallet home. */
export async function listOwnedNfcAccessories(
  vaultPda: string,
): Promise<PhygitalTokenWire[]> {
  const owner = address(vaultPda);
  const accounts = await fetchAllTokensFromOwner(owner, getSolanaRpc());
  const tokens = await Promise.all(
    accounts.map(async (account) => {
      const tokenAddress = await findTokenPda(account.publicKey);
      return phygitalTokenFromAccount(tokenAddress, account);
    }),
  );
  return tokens
    .filter((token) => isOwnedNfcAccessory(token, owner))
    .map(toPhygitalTokenWire);
}
