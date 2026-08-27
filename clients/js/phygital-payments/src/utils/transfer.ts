import { getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";
import { sha256 } from "@noble/hashes/sha2.js";

const PROGRAM_AUTHORITY_SEED = new TextEncoder().encode("program_authority");

export async function findProgramAuthorityPda(
  asset: Address,
  programAddress: Address,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress,
    seeds: [PROGRAM_AUTHORITY_SEED, getAddressEncoder().encode(asset)],
  });
  return pda;
}

/**
 * WebAuthn challenge / on-chain `verify_asset.message_hash`:
 * `sha256("phygital_payments:transfer" || mint || recipient || amount_le || slot_hash)`.
 */
export function buildTransferChallenge(
  mint: Address,
  recipient: Address,
  amount: bigint | number,
  slotHash: Uint8Array,
): Uint8Array {
  if (slotHash.length !== 32) {
    throw new Error("slotHash must be 32 bytes");
  }
  const prefix = new TextEncoder().encode("phygital_payments:transfer");
  const mintBytes = getAddressEncoder().encode(mint);
  const recipientBytes = getAddressEncoder().encode(recipient);
  const amountBytes = new Uint8Array(8);
  new DataView(amountBytes.buffer).setBigUint64(0, BigInt(amount), true);

  const preimage = new Uint8Array(
    prefix.length + mintBytes.length + recipientBytes.length + amountBytes.length + 32,
  );
  let offset = 0;
  preimage.set(prefix, offset);
  offset += prefix.length;
  preimage.set(mintBytes, offset);
  offset += mintBytes.length;
  preimage.set(recipientBytes, offset);
  offset += recipientBytes.length;
  preimage.set(amountBytes, offset);
  offset += amountBytes.length;
  preimage.set(slotHash, offset);
  return sha256(preimage);
}
