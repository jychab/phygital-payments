export const LAMPORTS_PER_SOL = 1_000_000_000n;

export function parseSolAmount(raw: string): bigint | null {
  const text = raw.trim();
  if (!text || text.length > 24) return null;
  if (!/^\d+(\.\d+)?$/.test(text)) return null;
  const [wholeRaw, fracRaw = ""] = text.split(".");
  if (fracRaw.length > 9) return null;
  const whole = BigInt(wholeRaw || "0");
  const frac = BigInt(fracRaw.padEnd(9, "0") || "0");
  return whole * LAMPORTS_PER_SOL + frac;
}

export function formatSol(lamports: bigint): string {
  const negative = lamports < 0n;
  const abs = negative ? -lamports : lamports;
  const whole = abs / LAMPORTS_PER_SOL;
  const frac = abs % LAMPORTS_PER_SOL;
  const sign = negative ? "-" : "";
  if (frac === 0n) return `${sign}${whole}`;
  return `${sign}${whole}.${frac.toString().padStart(9, "0").replace(/0+$/, "")}`;
}
