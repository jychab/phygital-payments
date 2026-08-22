import {
  type Instruction,
  type TransactionPartialSigner,
} from "@solana/kit";

import { queryFetch, readJson } from "@/lib/queries/http";
import { createAddressSigner } from "@/lib/solana/address-signer";
import { getSponsoredFeePayerAddress } from "@/lib/solana/simulate-sponsored";
import {
  instructionsToWire,
  type SponsorResponse,
} from "../../../shared/sponsor-wire";

/** Client-side fee payer. Signatures are applied by `/api/wallet/sponsor`. */
export function sponsoredFeePayerSigner(): TransactionPartialSigner {
  return createAddressSigner(
    getSponsoredFeePayerAddress(),
    "Sponsored fee payer signs on the server",
  );
}

export async function sponsorInstructions(
  instructions: readonly Instruction[],
): Promise<{ signature: string }> {
  if (instructions.length === 0) {
    throw new Error("Nothing to submit");
  }
  const res = await queryFetch("/api/wallet/sponsor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ instructions: instructionsToWire(instructions) }),
  });
  return readJson<SponsorResponse>(res, "Couldn’t submit the transaction");
}
