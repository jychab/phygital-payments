import { AccountRole, address, type Instruction } from "@solana/kit";

import { base64ToBytes } from "./base64";

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

export type SponsorRequest = {
  instructions: SponsoredInstructionWire[];
};

export type SponsorResponse = {
  signature: string;
  /** Block height after which the submitted tx’s blockhash is expired. */
  lastValidBlockHeight: number;
};

function roleFromFlags(writable: boolean, signer: boolean): AccountRole {
  if (writable && signer) return AccountRole.WRITABLE_SIGNER;
  if (signer) return AccountRole.READONLY_SIGNER;
  if (writable) return AccountRole.WRITABLE;
  return AccountRole.READONLY;
}

export function instructionFromWire(
  wire: SponsoredInstructionWire,
  data = base64ToBytes(wire.data),
): Instruction {
  return {
    programAddress: address(wire.programAddress),
    accounts: wire.accounts.map((account) => ({
      address: address(account.address),
      role: roleFromFlags(account.writable, account.signer),
    })),
    data,
  };
}
