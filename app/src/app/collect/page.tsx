import type { Metadata } from "next";

import { CollectApp } from "@/components/collect/collect-app";
import { parsePaymentRequest } from "@/lib/collect/payment-request";

export const metadata: Metadata = {
  title: "Collect — Phygital Pay",
  description: "Collect a payment with a tap",
};

type CollectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CollectPage({ searchParams }: CollectProps) {
  const params = await searchParams;
  const paymentRequest = parsePaymentRequest(params);
  return <CollectApp paymentRequest={paymentRequest} />;
}
