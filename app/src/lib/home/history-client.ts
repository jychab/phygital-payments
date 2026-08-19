/**
 * Client for the payment-history API. No Authorization header is sent
 * (see the history route for how it is gated server-side).
 */

export type PaymentRecord = {
  signature: string;
  transferIndex: number;
  slot: number | null;
  blockTime: number | null;
  mint: string;
  amount: string; // raw u64 decimal string
  senderOwner: string | null;
  recipientOwner: string | null;
  senderTokenAccount: string | null;
  recipientTokenAccount: string | null;
};

type HistoryResponse = {
  address: string;
  payments: PaymentRecord[];
  error?: string;
};

export async function fetchPaymentHistory(
  address: string,
  opts?: { limit?: number; beforeBlockTime?: number },
): Promise<PaymentRecord[]> {
  const params = new URLSearchParams({ address });
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.beforeBlockTime != null) {
    params.set("before", String(opts.beforeBlockTime));
  }

  const res = await fetch(`/api/payments/history?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  const data = (await res.json()) as HistoryResponse;
  if (!res.ok) {
    throw new Error(data.error ?? `History lookup failed (${res.status})`);
  }
  return data.payments;
}
