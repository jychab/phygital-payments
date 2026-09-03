/** Format token amounts without program deps. */

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
