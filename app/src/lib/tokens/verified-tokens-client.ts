/** Client helpers for verified token catalog + wallet holdings. */

import { queryFetch, readJson } from "@/lib/queries/http";
import type {
  PaymentToken,
  PaymentTokenHolding,
} from "@/lib/tokens/payment-token";

export async function fetchVerifiedTokensClient(): Promise<PaymentToken[]> {
  const res = await queryFetch("/api/tokens/verified");
  const body = await readJson<{ tokens?: PaymentToken[]; error?: string }>(
    res,
    "Couldn’t load tokens",
  );
  return body.tokens ?? [];
}

export async function fetchHoldingsClient(
  owner: string,
): Promise<PaymentTokenHolding[]> {
  const res = await queryFetch(
    `/api/tokens/holdings?owner=${encodeURIComponent(owner)}`,
  );
  const body = await readJson<{ holdings?: PaymentTokenHolding[]; error?: string }>(
    res,
    "Couldn’t load holdings",
  );
  return body.holdings ?? [];
}
