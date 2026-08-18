/**
 * Max tap amount in localStorage (this phone).
 * Silent Pay grants and Shortcuts cannot exceed min(max tap, spending limit).
 */

import { DEFAULT_PAY_AMOUNT_UI } from "@/lib/payments/payment-token";

const STORAGE = {
  amount: "phygital.pay.maxTapAmountUi",
  wallet: "phygital.pay.maxTapWallet",
} as const;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** Subscribe to max-tap storage changes (this origin / tab). */
export function subscribeMaxTapAmount(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

/** True when this wallet has a saved max tap amount on this phone. */
export function hasStoredMaxTapAmount(wallet: string): boolean {
  if (typeof window === "undefined") return false;
  const storedWallet = localStorage.getItem(STORAGE.wallet);
  const amount = localStorage.getItem(STORAGE.amount)?.trim() ?? "";
  return storedWallet === wallet && parseMaxTapAmountUi(amount) != null;
}

/** Normalize a UI amount string, or null if invalid. */
export function parseMaxTapAmountUi(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Number.isInteger(n) ? String(n) : String(n);
}

/** Read the stored max tap UI amount, or the $100 default. */
export function readMaxTapAmountUi(wallet: string): string {
  if (typeof window === "undefined") return DEFAULT_PAY_AMOUNT_UI;
  const storedWallet = localStorage.getItem(STORAGE.wallet);
  if (storedWallet !== wallet) return DEFAULT_PAY_AMOUNT_UI;
  const parsed = parseMaxTapAmountUi(
    localStorage.getItem(STORAGE.amount) ?? "",
  );
  return parsed ?? DEFAULT_PAY_AMOUNT_UI;
}

/** Persist the max tap UI amount for `wallet`. */
export function storeMaxTapAmountUi(wallet: string, amountUi: string): void {
  const parsed = parseMaxTapAmountUi(amountUi);
  if (!parsed) {
    throw new Error("Enter a valid amount");
  }
  if (typeof window === "undefined") {
    throw new Error("Max tap amount can only be saved on this phone.");
  }
  localStorage.setItem(STORAGE.amount, parsed);
  localStorage.setItem(STORAGE.wallet, wallet);
  emit();
}
