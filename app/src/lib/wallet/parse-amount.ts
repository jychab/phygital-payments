/** Parse a decimal UI amount into base units (lamports / token atoms). */
export function parseUiAmount(raw: string, decimals: number): bigint | null {
  const text = raw.trim();
  if (!text || decimals < 0 || decimals > 18 || !Number.isInteger(decimals)) {
    return null;
  }
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const [wholeRaw, fracRaw = ""] = text.split(".");
  if (fracRaw.length > decimals) return null;
  const whole = BigInt(wholeRaw || "0");
  const frac = BigInt(fracRaw.padEnd(decimals, "0") || "0");
  return whole * 10n ** BigInt(decimals) + frac;
}

/** Format base units as a decimal UI amount. */
export function formatUiAmount(atoms: bigint, decimals: number): string {
  if (decimals < 0 || decimals > 18 || !Number.isInteger(decimals)) {
    return atoms.toString();
  }
  const negative = atoms < 0n;
  const abs = negative ? -atoms : atoms;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  const frac = abs % base;
  const sign = negative ? "-" : "";
  if (frac === 0n) return `${sign}${whole}`;
  return `${sign}${whole}.${frac.toString().padStart(decimals, "0").replace(/0+$/, "")}`;
}
