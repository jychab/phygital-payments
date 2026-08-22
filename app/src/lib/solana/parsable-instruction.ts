import type {
  AccountMeta,
  Instruction,
  InstructionWithAccounts,
  InstructionWithData,
} from "@solana/kit";

/** Narrow Kit `Instruction` to the Codama parse helpers' required shape. */
export function isParsableInstruction(
  ix: Instruction,
): ix is Instruction &
  InstructionWithAccounts<readonly AccountMeta[]> &
  InstructionWithData<Uint8Array> {
  return ix.accounts !== undefined && ix.data !== undefined;
}
