import { getAddressEncoder, getProgramDerivedAddress, type Address } from "@solana/kit";

export const PROGRAM_AUTHORITY_SEED = new TextEncoder().encode("program_authority");

export async function findProgramAuthorityPda(
  owner: Address,
  programAddress: Address,
): Promise<Address> {
  const [pda] = await getProgramDerivedAddress({
    programAddress,
    seeds: [PROGRAM_AUTHORITY_SEED, getAddressEncoder().encode(owner)],
  });
  return pda;
}

export function buildTransferMessage(
  mint: Address,
  recipient: Address,
  amount: bigint | number,
): Uint8Array {
  const prefix = new TextEncoder().encode("phygital_payments:transfer");
  const mintBytes = getAddressEncoder().encode(mint);
  const recipientBytes = getAddressEncoder().encode(recipient);
  const amountBytes = new Uint8Array(8);
  new DataView(amountBytes.buffer).setBigUint64(0, BigInt(amount), true);

  const message = new Uint8Array(
    prefix.length + mintBytes.length + recipientBytes.length + amountBytes.length,
  );
  message.set(prefix, 0);
  message.set(mintBytes, prefix.length);
  message.set(recipientBytes, prefix.length + mintBytes.length);
  message.set(amountBytes, prefix.length + mintBytes.length + recipientBytes.length);
  return message;
}
