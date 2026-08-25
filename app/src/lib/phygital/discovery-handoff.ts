import type { PhygitalSurface } from "@/lib/phygital/surface";

const KEY = "phygital:discovery";

/**
 * Passkey-only handoff after a surface redirect (`/card` ↔ `/accessory`).
 * Never stores “Confirmed” — that must come from tap params or WebAuthn
 * in the current page (sessionStorage is forgeable).
 */
export type DiscoveryHandoff = {
  passkey: string;
  surface: PhygitalSurface;
};

function readRaw(): DiscoveryHandoff | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DiscoveryHandoff>;
    if (
      (parsed.surface !== "card" && parsed.surface !== "accessory") ||
      typeof parsed.passkey !== "string" ||
      !parsed.passkey.trim()
    ) {
      return null;
    }
    return {
      passkey: parsed.passkey,
      surface: parsed.surface,
    };
  } catch {
    return null;
  }
}

/** Stash a Hold-to-Check passkey so a surface redirect can reopen the same token. */
export function stashDiscovery(handoff: DiscoveryHandoff): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(handoff));
  } catch {
    /* private mode / quota */
  }
}

/** Consume a handoff destined for this surface, or leave it for the other route. */
export function takeDiscovery(surface: PhygitalSurface): DiscoveryHandoff | null {
  const parsed = readRaw();
  if (!parsed || parsed.surface !== surface) return null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  return parsed;
}
