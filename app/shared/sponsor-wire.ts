import {
  isSignerRole,
  isWritableRole,
  type Instruction,
} from "@solana/kit";

import { bytesToBase64 } from "./base64";

export type SponsoredAccountWire = {
  address: string;
  writable: boolean;
  signer: boolean;
};

export type SponsoredInstructionWire = {
  programAddress: string;
  accounts: SponsoredAccountWire[];
  data: string;
};

export type SponsorResponse = {
  signature: string;
  /** Block height after which the submitted tx’s blockhash is expired. */
  lastValidBlockHeight: number;
};

export function instructionToWire(ix: Instruction): SponsoredInstructionWire {
  return {
    programAddress: String(ix.programAddress),
    accounts: (ix.accounts ?? []).map((account) => ({
      address: String(account.address),
      writable: isWritableRole(account.role),
      signer: isSignerRole(account.role),
    })),
    data: bytesToBase64(Uint8Array.from(ix.data ?? [])),
  };
}

export function instructionsToWire(
  instructions: readonly Instruction[],
): SponsoredInstructionWire[] {
  return instructions.map(instructionToWire);
}
