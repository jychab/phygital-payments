/**
 * Per-wallet, per-mint max tap amount in localStorage (this phone).
 * Silent Pay grants cannot exceed min(max tap, spending limit).
 * USDC defaults to $100 when unset; other mints require a manual amount.
 */

import {
  DEFAULT_PAY_AMOUNT_UI,
  isDefaultMint,
} from "@/lib/tokens/payment-token";

const PREFIX = "phygital.pay.maxTapAmountUi.";

const listeners = new Set<() => void>();

function storageKey(wallet: string, mint: string): string {
  return `${PREFIX}${wallet}.${mint}`;
}

/** Pre-mint-keyed store: one amount per wallet (treated as USDC). */
function legacyWalletKey(wallet: string): string {
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

function readStored(wallet: string, mint: string): string | null {
  if (typeof window === "undefined") return null;
  const stored = parseMaxTapAmountUi(
    localStorage.getItem(storageKey(wallet, mint)) ?? "",
  );
  if (stored) return stored;
  if (!isDefaultMint(mint)) return null;
  return parseMaxTapAmountUi(
    localStorage.getItem(legacyWalletKey(wallet)) ?? "",
  );
}

export function hasStoredMaxTapAmount(wallet: string, mint: string): boolean {
  return readStored(wallet, mint) != null;
}

/**
 * Stored max tap, or the USDC $100 default. Other mints return `null`
 * until the user sets an amount.
 */
export function readMaxTapAmountUi(
  wallet: string,
  mint: string,
): string | null {
  return readStored(wallet, mint) ?? (isDefaultMint(mint) ? DEFAULT_PAY_AMOUNT_UI : null);
}

export function storeMaxTapAmountUi(
  wallet: string,
  mint: string,
  amountUi: string,
): void {
  const parsed = parseMaxTapAmountUi(amountUi);
  if (!parsed) {
    throw new Error("Enter a valid amount");
  }
  if (typeof window === "undefined") {
    throw new Error("Max tap amount can only be saved on this phone.");
  }
  localStorage.setItem(storageKey(wallet, mint), parsed);
  emit();
}
