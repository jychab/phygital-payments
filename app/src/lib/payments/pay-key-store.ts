/**
 * Device pay API key in localStorage (plaintext).
 * Used for in-app Pay and Shortcuts open URLs.
 */

const STORAGE = {
  apiKey: "phygital.preauth.apiKey",
  wallet: "phygital.preauth.wallet",
} as const;

/** Leftover Face ID PRF vault keys from older clients. */
const LEGACY_VAULT_KEYS = [
  "phygital.preauth.encrypted",
  "phygital.preauth.credentialId",
  "phygital.preauth.prfSalt",
] as const;

function clearLegacyVaultKeys(): void {
  for (const key of LEGACY_VAULT_KEYS) {
    localStorage.removeItem(key);
  }
}

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
  clearLegacyVaultKeys();
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
