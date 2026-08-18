"use client";

import { useSyncExternalStore } from "react";

import {
  readMaxTapAmountUi,
  subscribeMaxTapAmount,
} from "@/lib/payments/max-tap-store";
import { DEFAULT_PAY_AMOUNT_UI } from "@/lib/payments/payment-token";

/** Live max tap UI amount for `wallet` (localStorage, this phone). */
export function useMaxTapAmountUi(wallet: string | null): string {
  return useSyncExternalStore(
    subscribeMaxTapAmount,
    () => (wallet ? readMaxTapAmountUi(wallet) : DEFAULT_PAY_AMOUNT_UI),
    () => DEFAULT_PAY_AMOUNT_UI,
  );
}
