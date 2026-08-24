import { AccountRole, type Address, type Instruction } from "@solana/kit";

import { SYSTEM_PROGRAM_ADDRESS } from "@/lib/lazorkit/constants";

/** System Program `Transfer` (instruction 2). Vault is the CPI signer. */
export function transferSolInstruction(args: {
  from: Address;
  to: Address;
  lamports: bigint;
}): Instruction {
  const data = new Uint8Array(12);
  const view = new DataView(data.buffer);
  view.setUint32(0, 2, true);
  view.setBigUint64(4, args.lamports, true);
  return {
    programAddress: SYSTEM_PROGRAM_ADDRESS,
    accounts: [
      { address: args.from, role: AccountRole.WRITABLE_SIGNER },
      { address: args.to, role: AccountRole.WRITABLE },
    ],
    data,
  };
}
