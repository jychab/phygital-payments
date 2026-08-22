import { address, type Instruction } from "@solana/kit";

export const COMPUTE_BUDGET_PROGRAM_ADDRESS =
  "ComputeBudget111111111111111111111111111111";

const COMPUTE_BUDGET_PROGRAM = address(COMPUTE_BUDGET_PROGRAM_ADDRESS);

export function setComputeUnitLimitIx(units: number): Instruction {
  const data = new Uint8Array(5);
  data[0] = 0x02;
  new DataView(data.buffer).setUint32(1, units, true);
  return { programAddress: COMPUTE_BUDGET_PROGRAM, data };
}

export function setComputeUnitPriceIx(microLamports: bigint): Instruction {
  const data = new Uint8Array(9);
  data[0] = 0x03;
  new DataView(data.buffer).setBigUint64(1, microLamports, true);
  return { programAddress: COMPUTE_BUDGET_PROGRAM, data };
}

export function defaultComputeBudgetIxs(
  maxUnits: number,
  priorityFeeMicroLamports: bigint,
): Instruction[] {
  return [
    setComputeUnitPriceIx(priorityFeeMicroLamports),
    setComputeUnitLimitIx(maxUnits),
  ];
}
