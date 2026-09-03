import { type Address } from "@solana/kit";

import { getUsdcMint } from "@/lib/tokens/usdc-mint";

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

export function isDefaultMint(mint: string | Address): boolean {
  return String(mint) === String(getUsdcMint());
}
