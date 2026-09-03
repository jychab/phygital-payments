/**
 * User-selected Solana / DAS RPC (Backpack-style custom connection).
 * Persisted in localStorage; `getSolanaRpcUrl()` reads this at call time.
 */

const STORAGE_KEY = "phygital-wallet.solana-rpc";

export type RpcPreference =
  | { mode: "default" }
  | { mode: "custom"; url: string };

export function getDefaultRpcUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim() ||
    "https://api.devnet.solana.com"
  );
}

export function isValidRpcUrl(raw: string): boolean {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Host (+ path) without query string — hides API keys in UI. */
export function displayRpcEndpoint(url: string): string {
  try {
    const u = new URL(url.trim());
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.host}${path}`;
  } catch {
    return "Custom RPC";
  }
}

export function readRpcPreference(): RpcPreference {
  if (typeof window === "undefined") return { mode: "default" };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "default" };
    const parsed = JSON.parse(raw) as { mode?: string; url?: string };
    if (parsed.mode === "custom" && typeof parsed.url === "string") {
      const url = parsed.url.trim();
      if (isValidRpcUrl(url)) return { mode: "custom", url };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return { mode: "default" };
}

export function writeRpcPreference(pref: RpcPreference): void {
  if (typeof window === "undefined") return;
  if (pref.mode === "default") {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ mode: "custom", url: pref.url.trim() }),
  );
}

/** Active RPC URL for Kit + DAS (custom override or env default). */
export function resolveSolanaRpcUrl(
  pref: RpcPreference = readRpcPreference(),
): string {
  if (pref.mode === "custom") return pref.url.trim();
  return getDefaultRpcUrl();
}
