import type { Metadata } from "next";

import { SetupReceiveApp } from "@/components/setup-receive-app";
import { parsePaymentRequest } from "@/lib/payments/payment-request";

export const metadata: Metadata = {
  title: "Set up receive — Phygital Pay",
  description: "Create a USDC receive account for Collect",
};

type SetupProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SetupPage({ searchParams }: SetupProps) {
  const params = await searchParams;
  const paymentRequest = parsePaymentRequest(params);
  return <SetupReceiveApp paymentRequest={paymentRequest} />;
}
