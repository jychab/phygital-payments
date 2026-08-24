import { type Instruction } from "@solana/kit";

import { queryFetch, readJson } from "@/lib/queries/http";
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
  return readJson<SponsorResponse>(res, "Couldn’t submit the transaction");
}
