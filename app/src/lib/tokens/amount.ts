import { errorCopy } from "@/lib/copy/phygital";

/** Parse / format token amounts without program deps. */

export function formatTokenAmount(raw: bigint, decimals: number): string {
  if (raw === BigInt(0)) return "0";
  const negative = raw < BigInt(0);
  const abs = negative ? -raw : raw;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = (abs % base)
    .toString()
    .padStart(decimals, "0")
    .replace(/0+$/, "");
  const formatted = frac.length > 0 ? `${whole}.${frac}` : whole.toString();
  return negative ? `-${formatted}` : formatted;
}

export function uiAmountToRaw(uiAmount: string, decimals: number): bigint {
  const trimmed = uiAmount.trim();
  if (!trimmed || Number(trimmed) <= 0) {
    throw new Error(errorCopy.enterAmount.body);
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
