import { PaymentsApp } from "@/components/payments-app";
import { parsePaymentRequest } from "@/lib/payments/payment-request";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const paymentRequest = parsePaymentRequest(params);
  return <PaymentsApp paymentRequest={paymentRequest} />;
}
