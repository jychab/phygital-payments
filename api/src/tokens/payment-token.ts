import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";

import { getUsdcMint, USDC_DECIMALS } from "@/tokens/usdc-mint";

/** Classic SPL Token program — Token-2022 is out of scope for v1. */
export const CLASSIC_TOKEN_PROGRAM = TOKEN_PROGRAM_ADDRESS;

/**
 * USDC mark path — relative to the Next app origin (not this API host).
 */
const USDC_ICON_URL = "/tokens/usdc.png";

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

export function isClassicTokenProgram(
  program: string | null | undefined,
): boolean {
  return (
    program === CLASSIC_TOKEN_PROGRAM || program === String(CLASSIC_TOKEN_PROGRAM)
  );
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

export function zeroUsdcHolding(): PaymentTokenHolding {
  return { ...defaultUsdcToken(), balanceRaw: "0", balanceUi: "0" };
}
