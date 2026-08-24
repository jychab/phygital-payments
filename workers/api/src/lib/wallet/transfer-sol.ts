/** System Program `Transfer` (instruction 2). */
export function isSystemTransferInstruction(data: Uint8Array): boolean {
  if (data.length < 4) return false;
  return data[0] === 2 && data[1] === 0 && data[2] === 0 && data[3] === 0;
}
