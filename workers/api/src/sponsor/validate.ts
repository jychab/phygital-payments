import { address, type Address, type Instruction } from "@solana/kit";
import { PHYGITAL_TOKEN_PROGRAM_ADDRESS } from "phygital-token-sdk";
import {
  CREATE_SESSION_DISCRIMINATOR,
  CREATE_WALLET_DISCRIMINATOR,
  EXECUTE_DISCRIMINATOR,
  REVOKE_SESSION_DISCRIMINATOR,
} from "lazor-kit";

import {
  instructionFromWire,
  type SponsoredInstructionWire,
} from "@/shared/sponsor-wire";
import { COMPUTE_BUDGET_PROGRAM_ADDRESS } from "@solana-program/compute-budget";
import { base64ToBytes } from "@/shared/base64";
import {
  LAZORKIT_PROGRAM_DEVNET,
  LAZORKIT_PROGRAM_MAINNET,
  SECP256R1_PROGRAM_ADDRESS,
} from "@/lazorkit/constants";
import type { WalletSessionClaims } from "@/wallet/session-jwt";

/** SPL Memo (v1). Top-level System Program ixs are never sponsored. */
const MEMO_PROGRAM_ADDRESS = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

const ALLOWED_PROGRAMS = new Set<string>([
  String(LAZORKIT_PROGRAM_DEVNET),
  String(LAZORKIT_PROGRAM_MAINNET),
  String(SECP256R1_PROGRAM_ADDRESS),
  String(PHYGITAL_TOKEN_PROGRAM_ADDRESS),
  COMPUTE_BUDGET_PROGRAM_ADDRESS,
  MEMO_PROGRAM_ADDRESS,
]);

const LAZORKIT_PROGRAMS = new Set([
  String(LAZORKIT_PROGRAM_DEVNET),
  String(LAZORKIT_PROGRAM_MAINNET),
]);

const LAZORKIT_DISCS = [
  CREATE_WALLET_DISCRIMINATOR,
  EXECUTE_DISCRIMINATOR,
  CREATE_SESSION_DISCRIMINATOR,
  REVOKE_SESSION_DISCRIMINATOR,
];

function matchesU8Discriminator(
  data: ArrayLike<number>,
  disc: number,
): boolean {
  return data.length > 0 && data[0] === disc;
}

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
    const data = base64ToBytes(wire.data);
    if (LAZORKIT_PROGRAMS.has(wire.programAddress)) {
      if (!LAZORKIT_DISCS.some((disc) => matchesU8Discriminator(data, disc))) {
        throw new SponsorValidationError("That wallet instruction isn’t allowed");
      }
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
    return instructionFromWire(wire, data);
  });
}

/** True when the batch only creates a wallet (+ budget / secp helpers). */
export function isCreateWalletOnlyBatch(
  instructions: Instruction[],
): boolean {
  let sawCreateWallet = false;
  for (const ix of instructions) {
    const program = String(ix.programAddress);
    if (program === COMPUTE_BUDGET_PROGRAM_ADDRESS) continue;
    if (LAZORKIT_PROGRAMS.has(program)) {
      if (
        ix.data &&
        matchesU8Discriminator(ix.data, CREATE_WALLET_DISCRIMINATOR)
      ) {
        sawCreateWallet = true;
        continue;
      }
      return false;
    }
    if (program === String(SECP256R1_PROGRAM_ADDRESS)) continue;
    return false;
  }
  return sawCreateWallet;
}

/** Require LazorKit instructions reference the authenticated wallet PDAs. */
export function assertSponsoredInstructionsForSession(
  wires: SponsoredInstructionWire[],
  session: WalletSessionClaims,
): void {
  const vault = String(session.vaultPda);
  for (const wire of wires) {
    if (wire.programAddress === COMPUTE_BUDGET_PROGRAM_ADDRESS) continue;
    if (!LAZORKIT_PROGRAMS.has(wire.programAddress)) continue;
    const accounts = wire.accounts.map((account) => account.address);
    if (!accounts.includes(vault)) {
      throw new SponsorValidationError("Instructions don't match your wallet");
    }
  }
}
