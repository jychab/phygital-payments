import { address, type Address, type TransactionPartialSigner } from "@solana/kit";

import { queryFetch, readJson } from "@/lib/queries/http";
import { createAddressSigner } from "@/lib/solana/address-signer";

type FeePayerResponse = { publicKey: string };

let cachedFeePayer: Address | null = null;

/** Resolve the active sponsored fee-payer address from the API worker. */
export async function fetchFeePayerAddress(): Promise<Address> {
  if (cachedFeePayer) return cachedFeePayer;
  const res = await queryFetch("/api/wallet/fee-payer");
  const body = await readJson<FeePayerResponse>(res, "Couldn’t load fee payer");
  cachedFeePayer = address(body.publicKey);
  return cachedFeePayer;
}

/** Client-side fee payer placeholder; signatures are applied by `/api/wallet/sponsor`. */
export async function sponsoredFeePayerSigner(): Promise<TransactionPartialSigner> {
  return createAddressSigner(
    await fetchFeePayerAddress(),
    "Sponsored fee payer signs on the server",
  );
}
