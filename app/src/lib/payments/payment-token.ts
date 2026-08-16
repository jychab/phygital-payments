import { type Address } from "@solana/kit";
import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";

import { getUsdcMint, USDC_DECIMALS } from "@/lib/payments/usdc-mint";
import { shortAddress } from "@/lib/utils";

/** Classic SPL Token program — Token-2022 is out of scope for v1. */
export const CLASSIC_TOKEN_PROGRAM = TOKEN_PROGRAM_ADDRESS;

/**
 * USDC mark (Solana token-list logo, vendored under public/).
 * Local path avoids hotlink/referrer failures on raw.githubusercontent.com.
 */
export const USDC_ICON_URL = "/tokens/usdc.png";

export type PaymentToken = {
  mint: string;
  symbol: string;
  name: string;
  icon: string | null;
  decimals: number;
  tokenProgram: string;
};

export type PaymentTokenHolding = PaymentToken & {
  balanceRaw: string;
  balanceUi: string;
};

/** Default Collect / Pay mint (cluster USDC). */
export function getDefaultMint(): Address {
  return getUsdcMint();
}

export function isClassicTokenProgram(program: string | null | undefined): boolean {
  return program === CLASSIC_TOKEN_PROGRAM || program === String(CLASSIC_TOKEN_PROGRAM);
}

/** Built-in USDC metadata when Jupiter is unavailable (devnet / no API key). */
export function defaultUsdcToken(): PaymentToken {
  return {
    mint: String(getUsdcMint()),
    symbol: "USDC",
    name: "USD Coin",
    icon: USDC_ICON_URL,
    decimals: USDC_DECIMALS,
    tokenProgram: String(CLASSIC_TOKEN_PROGRAM),
  };
}

export function isDefaultMint(mint: string | Address): boolean {
  return String(mint) === String(getUsdcMint());
}

/** Resolve mint metadata from a catalog (USDC / short address fallback). */
export function resolvePaymentToken(
  mint: string | Address,
  catalog?: PaymentToken[] | null,
): PaymentToken {
  const mintStr = String(mint);
  const found = catalog?.find((t) => t.mint === mintStr);
  if (found) {
    if (isDefaultMint(found.mint) && !found.icon?.trim()) {
      return { ...found, icon: USDC_ICON_URL };
    }
    return found;
  }
  if (isDefaultMint(mintStr)) return defaultUsdcToken();
  return {
    mint: mintStr,
    symbol: shortAddress(mintStr, 4),
    name: "Unknown token",
    icon: null,
    decimals: USDC_DECIMALS,
    tokenProgram: String(CLASSIC_TOKEN_PROGRAM),
  };
}

/** Client-side filter over a verified catalog (symbol / name / mint). */
export function filterPaymentTokens(
  tokens: PaymentToken[],
  query: string,
): PaymentToken[] {
  const q = query.trim().toLowerCase();
  if (!q) return tokens;
  return tokens.filter((t) => {
    const hay = `${t.symbol} ${t.name} ${t.mint}`.toLowerCase();
    return hay.includes(q);
  });
}

