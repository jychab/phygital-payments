import { address, type Address } from "@solana/kit";

import { getUsdcMint } from "@/lib/payments/usdc";

export type PaymentRequestParams = {
  amount?: string;
  mint?: string;
  recipient?: string;
};

export type PaymentRequest = {
  amount: string | null;
  mint: Address;
  /** Recipient wallet the payment settles to, when provided via `?recipient=`. */
  recipient: Address | null;
  /** True when any payment-request param was present in the URL. */
  fromUrl: boolean;
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function tryAddress(value: string | undefined): Address | null {
  if (!value?.trim()) return null;
  try {
    return address(value.trim());
  } catch {
    return null;
  }
}

function normalizeAmount(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  const cleaned = value.trim().replace(/[^0-9.]/g, "");
  if (!cleaned || Number(cleaned) <= 0) return null;
  const [whole = "0", ...rest] = cleaned.split(".");
  const frac = rest.join("").slice(0, 6);
  return frac.length > 0 ? `${whole}.${frac}` : whole;
}

/** Parse `?amount=&recipient=` into a receive-flow payment request. */
export function parsePaymentRequest(
  searchParams: Record<string, string | string[] | undefined> | PaymentRequestParams,
): PaymentRequest {
  const amountRaw = firstValue(searchParams.amount as string | string[] | undefined);
  const recipientRaw = firstValue(
    searchParams.recipient as string | string[] | undefined,
  );

  const fromUrl = Boolean(
    amountRaw?.trim() || recipientRaw?.trim(),
  );

  const mint = getUsdcMint();

  return {
    amount: normalizeAmount(amountRaw),
    mint,
    recipient: tryAddress(recipientRaw),
    fromUrl,
  };
}
