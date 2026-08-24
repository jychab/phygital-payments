import { createNoopSigner, type Address, type Instruction } from "@solana/kit";
import { getTransferSolInstruction } from "@solana-program/system";

/** System Program `Transfer`. Vault is the CPI signer. */
export function transferSolInstruction(args: {
  from: Address;
  to: Address;
  lamports: bigint;
}): Instruction {
  const ix = getTransferSolInstruction({
    source: createNoopSigner(args.from),
    destination: args.to,
    amount: args.lamports,
  });
  return {
    programAddress: ix.programAddress,
    accounts: (ix.accounts ?? []).map(({ address, role }) => ({
      address,
      role,
    })),
    data: ix.data,
  };
}
