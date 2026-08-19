"use client";

import { useSyncExternalStore } from "react";

import {
  readMaxTapAmountUi,
  subscribeMaxTapAmount,
} from "@/lib/pay/max-tap-store";
import {
  DEFAULT_PAY_AMOUNT_UI,
  isDefaultMint,
} from "@/lib/tokens/payment-token";

/** Live max tap UI amount for `wallet` + `mint` (localStorage, this phone). */
export function useMaxTapAmountUi(
  wallet: string | null,
  mint: string | null,
): string | null {
  return useSyncExternalStore(
    subscribeMaxTapAmount,
    () => (wallet && mint ? readMaxTapAmountUi(wallet, mint) : null),
    () =>
      wallet && mint && isDefaultMint(mint) ? DEFAULT_PAY_AMOUNT_UI : null,
  );
}
