import {
  AccountRole,
  address,
  isSignerRole,
  isWritableRole,
  type Instruction,
} from "@solana/kit";

import { bytesToBase64, base64ToBytes } from "./base64";

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

function roleFromFlags(writable: boolean, signer: boolean): AccountRole {
  if (writable && signer) return AccountRole.WRITABLE_SIGNER;
  if (signer) return AccountRole.READONLY_SIGNER;
  if (writable) return AccountRole.WRITABLE;
  return AccountRole.READONLY;
}

export function instructionFromWire(
  wire: SponsoredInstructionWire,
): Instruction {
  return {
    programAddress: address(wire.programAddress),
    accounts: wire.accounts.map((account) => ({
      address: address(account.address),
      role: roleFromFlags(account.writable, account.signer),
    })),
    data: base64ToBytes(wire.data),
  };
}
