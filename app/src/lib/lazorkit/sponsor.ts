import { type Instruction } from "@solana/kit";

import { queryFetch, readJson } from "@/lib/queries/http";
import { waitForSignatureConfirmed } from "@/lib/solana/wait-for-confirmation";
import {
  instructionsToWire,
  type SponsorResponse,
} from "../../../shared/sponsor-wire";

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
  const submitted = await readJson<SponsorResponse>(
    res,
    "Couldn’t submit the transaction",
  );
  await waitForSignatureConfirmed(
    submitted.signature,
    submitted.lastValidBlockHeight,
  );
  return { signature: submitted.signature };
}
