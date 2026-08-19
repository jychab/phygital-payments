/**
 * Per-wallet max tap amount in localStorage (this phone).
 * Silent Pay grants cannot exceed min(max tap, spending limit).
 */

import { DEFAULT_PAY_AMOUNT_UI } from "@/lib/tokens/payment-token";

const PREFIX = "phygital.pay.maxTapAmountUi.";

const listeners = new Set<() => void>();

function storageKey(wallet: string): string {
  return `${PREFIX}${wallet}`;
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeMaxTapAmount(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function parseMaxTapAmountUi(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Number.isInteger(n) ? String(n) : String(n);
}

export function hasStoredMaxTapAmount(wallet: string): boolean {
  if (typeof window === "undefined") return false;
  return (
    parseMaxTapAmountUi(localStorage.getItem(storageKey(wallet)) ?? "") != null
  );
}

export function readMaxTapAmountUi(wallet: string): string {
  if (typeof window === "undefined") return DEFAULT_PAY_AMOUNT_UI;
  return (
    parseMaxTapAmountUi(localStorage.getItem(storageKey(wallet)) ?? "") ??
    DEFAULT_PAY_AMOUNT_UI
  );
}

export function storeMaxTapAmountUi(wallet: string, amountUi: string): void {
  const parsed = parseMaxTapAmountUi(amountUi);
  if (!parsed) {
    throw new Error("Enter a valid amount");
  }
  if (typeof window === "undefined") {
    throw new Error("Max tap amount can only be saved on this phone.");
  }
  localStorage.setItem(storageKey(wallet), parsed);
  emit();
}
