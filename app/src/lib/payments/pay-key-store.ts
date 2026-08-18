/**
 * Device pay key in localStorage (plaintext).
 * Used for in-app Pay and Shortcuts open URLs.
 */

const STORAGE = {
  apiKey: "phygital.preauth.apiKey",
  wallet: "phygital.preauth.wallet",
} as const;

/** Sync check: plaintext pay key exists for `wallet`. */
export function hasStoredPayApiKey(wallet?: string): boolean {
  if (typeof window === "undefined") return false;
  const apiKey = localStorage.getItem(STORAGE.apiKey);
  if (!apiKey) return false;
  const storedWallet = localStorage.getItem(STORAGE.wallet);
  if (wallet && storedWallet !== wallet) return false;
  return true;
}

/** Persist the issued pay key for this wallet. */
export function storePayApiKey(wallet: string, apiKey: string): void {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error("Pay isn't set up on this phone yet.");
  }
  localStorage.setItem(STORAGE.apiKey, trimmed);
  localStorage.setItem(STORAGE.wallet, wallet);
}

/** Read the stored pay key for `wallet`. */
export function readPayApiKey(wallet: string): string {
  if (typeof window === "undefined") {
    throw new Error("Pay isn't set up on this phone yet.");
  }
  const storedWallet = localStorage.getItem(STORAGE.wallet);
  const apiKey = localStorage.getItem(STORAGE.apiKey)?.trim() ?? "";
  if (storedWallet !== wallet || !apiKey) {
    throw new Error("Pay isn't set up on this phone yet.");
  }
  return apiKey;
}
