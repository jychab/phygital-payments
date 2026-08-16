import { address, type Address } from "@solana/kit";

import { getDefaultMint, isDefaultMint } from "@/lib/payments/payment-token";

export type PaymentRequestParams = {
  amount?: string;
  recipient?: string;
  /** Defaults to USDC. */
  mint?: string;
};

export type PaymentRequest = {
  amount: string | null;
  mint: Address;
  /** Recipient wallet the payment settles to, when provided via `?recipient=`. */
  recipient: Address | null;
  /** True when `?recipient=` was present (even if invalid). */
  hasRecipientParam: boolean;
  /** True when any payment-request param was present in the URL. */
  fromUrl: boolean;
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/** Validate a string as a Solana address; returns the parsed address or null. */
export function tryParseAddress(value: string | null | undefined): Address | null {
  if (!value?.trim()) return null;
  try {
    return address(value.trim());
  } catch {
    return null;
  }
}

function normalizeAmount(
  value: string | undefined,
  maxDecimals = 18,
): string | null {
  if (!value?.trim()) return null;
  const cleaned = value.trim().replace(/[^0-9.]/g, "");
  if (!cleaned || Number(cleaned) <= 0) return null;
  const [whole = "0", ...rest] = cleaned.split(".");
  const frac = rest.join("").slice(0, maxDecimals);
  return frac.length > 0 ? `${whole}.${frac}` : whole;
}

/** Parse `?amount=&recipient=&mint=` into a receive-flow payment request. */
export function parsePaymentRequest(
  searchParams: Record<string, string | string[] | undefined> | PaymentRequestParams,
): PaymentRequest {
  const amountRaw = firstValue(searchParams.amount as string | string[] | undefined);
  const recipientRaw = firstValue(
    searchParams.recipient as string | string[] | undefined,
  );
  const mintRaw = firstValue(searchParams.mint as string | string[] | undefined);

  const fromUrl = Boolean(
    amountRaw?.trim() || recipientRaw?.trim() || mintRaw?.trim(),
  );
  const hasRecipientParam = Boolean(recipientRaw?.trim());
  const usdc = getDefaultMint();
  const mint = tryParseAddress(mintRaw) ?? usdc;

  return {
    amount: normalizeAmount(amountRaw),
    mint,
    recipient: tryParseAddress(recipientRaw),
    hasRecipientParam,
    fromUrl,
  };
}

type PaymentLinkArgs = {
  recipient: string;
  mint?: string;
  amount?: string | null;
};

function paymentLinkHref(path: "/collect" | "/setup", args: PaymentLinkArgs): string {
  const params = new URLSearchParams();
  params.set("recipient", args.recipient);
  if (args.mint && !isDefaultMint(args.mint)) params.set("mint", args.mint);
  if (args.amount) params.set("amount", args.amount);
  return `${path}?${params.toString()}`;
}

/** Build `/setup` URL for one-time receive-account creation. */
export function receiveSetupHref(args: PaymentLinkArgs): string {
  return paymentLinkHref("/setup", args);
}

/** Build `/collect` URL (payment link / after setup). */
export function collectHref(args: PaymentLinkArgs): string {
  return paymentLinkHref("/collect", args);
}
