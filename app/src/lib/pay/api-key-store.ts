/**
 * Per-wallet API keys in localStorage (plaintext).
 * Keyed by wallet so a new key replaces the previous one for that owner.
 */

const PREFIX = "phygital.preauth.apiKey.";

export const API_KEY_NOT_SET_UP = "Pay isn't turned on here yet.";

function storageKey(wallet: string): string {
  return `${PREFIX}${wallet}`;
}

export function readApiKey(wallet: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKey(wallet))?.trim() || null;
}

export function hasStoredApiKey(wallet: string): boolean {
  return Boolean(readApiKey(wallet));
}

export function storeApiKey(wallet: string, apiKey: string): void {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error("Paste it here first.");
  }
  if (typeof window === "undefined") {
    throw new Error(API_KEY_NOT_SET_UP);
  }
  localStorage.setItem(storageKey(wallet), trimmed);
}

export function clearApiKey(wallet: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(wallet));
}

export function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 8) return "•".repeat(Math.max(trimmed.length, 4));
  return `${trimmed.slice(0, 4)}${"•".repeat(16)}${trimmed.slice(-4)}`;
}
