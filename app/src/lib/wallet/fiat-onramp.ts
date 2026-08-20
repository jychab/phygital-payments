import { isMainnet } from "@/lib/solana/cluster";
import { USDC_MINT_MAINNET } from "@/lib/tokens/usdc-mint";

/**
 * Solana mainnet CAIP-2 (genesis hash). Stripe / Privy onramps do not settle
 * to testnets, even in sandbox.
 */
export const SOLANA_ONRAMP_CHAIN =
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;

export const SOLANA_ONRAMP_USDC = String(USDC_MINT_MAINNET);

export const ONRAMP_DEFAULT_AMOUNT = "50";

export function onrampEnvironment(): "sandbox" | "production" {
  return isMainnet() ? "production" : "sandbox";
}

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error != null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return typeof error === "string" ? error : "";
}

/** User closed the Privy / provider sheet before buying. */
export function isOnrampUserExit(error: unknown): boolean {
  return /user_exited|user closed|closed the flow|cancel|abort|dismiss/i.test(
    errorText(error),
  );
}
