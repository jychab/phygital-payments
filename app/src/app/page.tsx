import { PaymentsApp } from "@/components/payments-app";
import { parsePaymentRequest } from "@/lib/payments/payment-request";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const paymentRequest = parsePaymentRequest(params);
  // `?mode=receive` only applies when embedded — it switches the vault view from
  // the allowance manager to the receive flow. Ignored standalone.
  const modeParam = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const requestedReceive = modeParam?.trim().toLowerCase() === "receive";
  return (
    <PaymentsApp
      paymentRequest={paymentRequest}
      requestedReceive={requestedReceive}
    />
  );
}
