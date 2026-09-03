import { getAddMemoInstruction } from "@solana-program/memo";
import type { Instruction } from "@solana/kit";

export function getMemoInstruction(memo: string): Instruction {
  return getAddMemoInstruction({ memo });
}
