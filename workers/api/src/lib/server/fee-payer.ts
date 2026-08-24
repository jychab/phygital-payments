import { address, type Address } from "@solana/kit";

import { getSignerClient } from "@/lib/signer/get-signer-client";

let cachedFeePayer: Address | undefined;

/** Active fee-payer pubkey from the signer (not env). Cached per isolate. */
export async function getFeePayerAddress(): Promise<Address> {
  if (cachedFeePayer) return cachedFeePayer;
  const { publicKey } = await getSignerClient().getFeePayerPublicKey();
  cachedFeePayer = address(publicKey);
  return cachedFeePayer;
}
