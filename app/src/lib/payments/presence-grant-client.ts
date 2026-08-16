/** Client helpers for the payer-side preauth presence window. */

const API_KEY_STORAGE = "phygital.preauth.apiKey";
const API_KEY_WALLET_STORAGE = "phygital.preauth.wallet";

export type PreauthResponse = {
  expiresAt: number;
  grantId: string;
  wallet: string;
};

/** Load the device pay key only when it belongs to `wallet`. */
export function loadPreauthApiKey(wallet?: string): string | null {
  if (typeof window === "undefined") return null;
  const key = localStorage.getItem(API_KEY_STORAGE);
  if (!key) return null;
  const storedWallet = localStorage.getItem(API_KEY_WALLET_STORAGE);
  if (wallet) {
    if (!storedWallet || storedWallet !== wallet) return null;
  }
  return key;
}

export function storePreauthApiKey(apiKey: string, wallet: string): void {
  localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
  localStorage.setItem(API_KEY_WALLET_STORAGE, wallet);
}

export function clearPreauthApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem(API_KEY_WALLET_STORAGE);
}

/** Build the integrator / in-app open URL (relative or absolute). */
export function buildPreauthOpenUrl(args: {
  apiKey: string;
  /** Defaults to `window.location.origin` in the browser. */
  origin?: string;
}): string {
  const params = new URLSearchParams();
  params.set("apiKey", args.apiKey.trim());
  const path = `/api/preauth/open?${params.toString()}`;
  const origin =
    args.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return origin ? `${origin}${path}` : path;
}

/**
 * Open a short-lived presence window via GET /api/preauth/open.
 * Call this on the payer phone *before* tapping the merchant NFC device.
 * Spend mint/amount come from Collect; caps are on-chain delegates.
 */
export async function requestPreauth(args: {
  apiKey?: string;
  wallet?: string;
}): Promise<PreauthResponse> {
  const apiKey =
    args.apiKey?.trim() || loadPreauthApiKey(args.wallet) || null;
  if (!apiKey) {
    throw new Error("Missing preauth API key — enable Pay on this device first");
  }

  const url = buildPreauthOpenUrl({
    apiKey,
    origin: "",
  });

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const body = (await res.json()) as PreauthResponse & { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `Preauth failed (${res.status})`);
  }
  return body;
}

/** Invalidate the open grant for this device key (Cancel / dismiss). */
export async function cancelPreauth(args?: {
  apiKey?: string;
  wallet?: string;
}): Promise<void> {
  const apiKey =
    args?.apiKey?.trim() || loadPreauthApiKey(args?.wallet) || null;
  if (!apiKey) return;

  const res = await fetch("/api/preauth", {
    method: "DELETE",
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok && res.status !== 401) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Cancel preauth failed (${res.status})`);
  }
}
