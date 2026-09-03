import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";

import { getUsdcMint, USDC_DECIMALS } from "@/tokens/usdc-mint";
import { TOKEN_2022_PROGRAM } from "@/verifier/constants";

export const CLASSIC_TOKEN_PROGRAM = TOKEN_PROGRAM_ADDRESS;

/** Sentinel mint for native SOL holdings / sends. */
export const NATIVE_SOL_MINT =
  "So11111111111111111111111111111111111111112" as const;

/** Marks a holding as native SOL (not wrapped SPL). */
export const NATIVE_SOL_TOKEN_PROGRAM = "native" as const;

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
    program === CLASSIC_TOKEN_PROGRAM ||
    program === String(CLASSIC_TOKEN_PROGRAM)
  );
}

export function isToken2022Program(
  program: string | null | undefined,
): boolean {
  return program === TOKEN_2022_PROGRAM || program === String(TOKEN_2022_PROGRAM);
}

export function isSupportedTokenProgram(
  program: string | null | undefined,
): boolean {
  return isClassicTokenProgram(program) || isToken2022Program(program);
}

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

export function nativeSolHolding(
  balanceRaw: bigint,
  balanceUi: string,
): PaymentTokenHolding {
  return {
    mint: NATIVE_SOL_MINT,
    symbol: "SOL",
    name: "Solana",
    icon: null,
    decimals: 9,
    tokenProgram: NATIVE_SOL_TOKEN_PROGRAM,
    balanceRaw: balanceRaw.toString(),
    balanceUi,
  };
}
