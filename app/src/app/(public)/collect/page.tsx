import type { Metadata } from "next";

import { PaymentsApp } from "@/components/payments-app";
import { parsePaymentRequest } from "@/lib/payments/payment-request";

export const metadata: Metadata = {
  title: "Collect — Phygital Pay",
  description: "Collect a tap-to-pay payment",
};

type CollectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CollectPage({ searchParams }: CollectProps) {
  const params = await searchParams;
  const paymentRequest = parsePaymentRequest(params);
  return <PaymentsApp paymentRequest={paymentRequest} />;
}
