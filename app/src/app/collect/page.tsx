import type { Metadata } from "next";

import { CollectApp } from "@/components/collect/collect-app";
import { parsePaymentRequest } from "@/lib/collect/payment-request";
import { products } from "@/lib/copy/phygital";

export const metadata: Metadata = {
  title: products.collect.name,
  description: products.collect.tagline,
};

type CollectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CollectPage({ searchParams }: CollectProps) {
  const params = await searchParams;
  const paymentRequest = parsePaymentRequest(params);
  return <CollectApp paymentRequest={paymentRequest} />;
}
