import "server-only";

import { address, type Address, type Instruction } from "@solana/kit";
import { PHYGITAL_TOKEN_PROGRAM_ADDRESS } from "phygital-token-sdk";

import {
  instructionFromWire,
  type SponsoredInstructionWire,
} from "../../../shared/sponsor-wire";
import {
  LAZORKIT_PROGRAM_DEVNET,
  LAZORKIT_PROGRAM_MAINNET,
  SECP256R1_PROGRAM_ADDRESS,
  SYSTEM_PROGRAM_ADDRESS,
} from "@/lib/lazorkit/constants";

const COMPUTE_BUDGET_PROGRAM = "ComputeBudget111111111111111111111111111111";

const ALLOWED_PROGRAMS = new Set<string>([
  String(LAZORKIT_PROGRAM_DEVNET),
  String(LAZORKIT_PROGRAM_MAINNET),
  String(SYSTEM_PROGRAM_ADDRESS),
  String(SECP256R1_PROGRAM_ADDRESS),
  String(PHYGITAL_TOKEN_PROGRAM_ADDRESS),
  COMPUTE_BUDGET_PROGRAM,
]);

export class SponsorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SponsorValidationError";
  }
}

export function validateSponsoredInstructions(
  wires: SponsoredInstructionWire[],
  feePayer: Address,
): Instruction[] {
  if (!Array.isArray(wires) || wires.length === 0) {
    throw new SponsorValidationError("No instructions");
  }
  if (wires.length > 24) {
    throw new SponsorValidationError("Too many instructions");
  }

  const feePayerStr = String(feePayer);
  return wires.map((wire, index) => {
    if (!wire?.programAddress || !Array.isArray(wire.accounts) || !wire.data) {
      throw new SponsorValidationError(`Instruction ${index} is malformed`);
    }
    if (!ALLOWED_PROGRAMS.has(wire.programAddress)) {
      throw new SponsorValidationError(
        `Program ${wire.programAddress} is not allowed`,
      );
    }
    for (const account of wire.accounts) {
      if (!account?.address) {
        throw new SponsorValidationError(`Instruction ${index} has a bad account`);
      }
      address(account.address);
      if (account.signer && account.address !== feePayerStr) {
        throw new SponsorValidationError(
          "Only the fee payer may be a transaction signer",
        );
      }
    }
    address(wire.programAddress);
    return instructionFromWire(wire);
  });
}
