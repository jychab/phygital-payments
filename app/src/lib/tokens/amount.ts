/** Parse a UI token amount to raw units. */

export function uiAmountToRaw(uiAmount: string, decimals: number): bigint {
  const trimmed = uiAmount.trim();
  if (!trimmed || Number(trimmed) <= 0) {
    throw new Error("Enter a valid amount");
  }
  const [whole = "0", frac = ""] = trimmed.split(".");
  if (frac.length > decimals) {
    throw new Error(`Amount supports at most ${decimals} decimals`);
  }
  const padded = frac.padEnd(decimals, "0");
  const wholePart = BigInt(whole.replace(/^0+(?=\d)/, "") || "0");
  const fracPart = BigInt(padded || "0");
  return wholePart * 10n ** BigInt(decimals) + fracPart;
}
