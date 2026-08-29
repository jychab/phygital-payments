import { type Address } from "@solana/kit";

import { tryParseAddress } from "@/lib/solana/address";
import { getDefaultMint, isDefaultMint } from "@/lib/tokens/payment-token";

/** `/collect` URL parse + builders (`?recipient=&mint=&amount=`). */

export type PaymentRequest = {
  amount: string | null;
  mint: Address;
  /** Recipient from `?recipient=`, or null when Collect should use the connected wallet. */
  recipient: Address | null;
  /** True when `?recipient=` was present (even if invalid). */
  hasRecipientParam: boolean;
};

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
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
  searchParams: Record<string, string | string[] | undefined>,
): PaymentRequest {
  const amountRaw = firstValue(searchParams.amount as string | string[] | undefined);
  const recipientRaw = firstValue(
    searchParams.recipient as string | string[] | undefined,
  );
  const mintRaw = firstValue(searchParams.mint as string | string[] | undefined);

  const hasRecipientParam = Boolean(recipientRaw?.trim());
  const usdc = getDefaultMint();
  const mint = tryParseAddress(mintRaw) ?? usdc;

  return {
    amount: normalizeAmount(amountRaw),
    mint,
    recipient: tryParseAddress(recipientRaw),
    hasRecipientParam,
  };
}

type PaymentLinkArgs = {
  recipient: string;
  mint?: string;
  amount?: string | null;
};

/** Build `/collect` URL (payment link). */
export function collectHref(args: PaymentLinkArgs): string {
  const params = new URLSearchParams();
  params.set("recipient", args.recipient);
  if (args.mint && !isDefaultMint(args.mint)) params.set("mint", args.mint);
  if (args.amount) params.set("amount", args.amount);
  return `/collect?${params.toString()}`;
}
