import { address, type Address } from "@solana/kit";

export function getSponsoredFeePayerAddress(): Address {
  const raw = process.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim();
  if (!raw) {
    throw new Error("Sponsored submit is not configured");
  }
  return address(raw);
}
