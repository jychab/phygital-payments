/** Client helpers for verified token catalog + wallet holdings. */

import type {
  PaymentToken,
  PaymentTokenHolding,
} from "@/lib/payments/payment-token";

export type { PaymentToken, PaymentTokenHolding };

async function readJson<T extends { error?: string }>(
  res: Response,
  fallback: string,
): Promise<T> {
  const body = (await res.json().catch(() => ({}))) as T;
  if (!res.ok) {
    throw new Error(body.error ?? fallback);
  }
  return body;
}

export async function fetchVerifiedTokensClient(): Promise<PaymentToken[]> {
  const res = await fetch("/api/tokens/verified", { cache: "force-cache" });
  const body = await readJson<{ tokens?: PaymentToken[]; error?: string }>(
    res,
    "Couldn’t load tokens",
  );
  return body.tokens ?? [];
}

export async function fetchHoldingsClient(
  owner: string,
): Promise<PaymentTokenHolding[]> {
  const res = await fetch(
    `/api/tokens/holdings?owner=${encodeURIComponent(owner)}`,
    { cache: "default" },
  );
  const body = await readJson<{ holdings?: PaymentTokenHolding[]; error?: string }>(
    res,
    "Couldn’t load holdings",
  );
  return body.holdings ?? [];
}
