import type { Address, Instruction, TransactionSigner } from "@solana/kit";

import { LAZORKIT_PROGRAM_PROGRAM_ADDRESS } from "./constants";
import {
  getCreateSessionInstruction,
  getRevokeSessionInstruction,
  type RevokeSessionInput,
} from "./generated/instructions";

export function buildCreateSessionInstruction(args: {
  payer: TransactionSigner;
  wallet: Address;
  adminAuthority: Address;
  session: Address;
  sessionKey: Uint8Array;
  expiresAtSlot: bigint;
  actions?: Uint8Array;
  programAddress?: Address;
}): Instruction {
  return getCreateSessionInstruction(
    {
      payer: args.payer,
      wallet: args.wallet,
      adminAuthority: args.adminAuthority,
      session: args.session,
      sessionKey: args.sessionKey,
      expiresAt: args.expiresAtSlot,
      actions: args.actions,
    },
    { programAddress: args.programAddress ?? LAZORKIT_PROGRAM_PROGRAM_ADDRESS },
  );
}

export function buildRevokeSessionInstruction(
  input: RevokeSessionInput,
  config?: { programAddress?: Address },
): Instruction {
  return getRevokeSessionInstruction(input, config);
}
