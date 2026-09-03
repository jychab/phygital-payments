import { type Address } from "@solana/kit";

import { getUsdcMint } from "@/lib/tokens/usdc-mint";

export const USDC_ICON_URL = "/tokens/usdc.png";

export const NATIVE_SOL_MINT =
  "So11111111111111111111111111111111111111112" as const;

export const NATIVE_SOL_TOKEN_PROGRAM = "native" as const;

export const CLASSIC_TOKEN_PROGRAM =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as const;

export const TOKEN_2022_PROGRAM =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" as const;

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

export function isDefaultMint(mint: string | Address): boolean {
  return String(mint) === String(getUsdcMint());
}

export function isNativeSolHolding(h: {
  mint: string;
  tokenProgram: string;
}): boolean {
  return h.tokenProgram === NATIVE_SOL_TOKEN_PROGRAM;
}

export function isToken2022Program(program: string | null | undefined): boolean {
  return program === TOKEN_2022_PROGRAM;
}
