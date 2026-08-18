/** Client helpers for the payer-side preauth spending window. */

import { readPayApiKey } from "@/lib/payments/pay-key-store";

export type PreauthResponse = {
  expiresAt: number;
  grantId: string;
  wallet: string;
  maxAmount: string;
  mint: string | null;
};

/** Build the integrator / Shortcuts open URL (apiKey in query string). */
export function buildPreauthOpenUrl(args: {
  apiKey: string;
  amountUi?: string;
  amount?: string;
  mint?: string;
  /** Defaults to `window.location.origin` in the browser. */
  origin?: string;
}): string {
  const params = new URLSearchParams();
  params.set("apiKey", args.apiKey.trim());
  if (args.amountUi != null && args.amountUi !== "") {
    params.set("amountUi", args.amountUi);
  } else if (args.amount != null && args.amount !== "") {
    params.set("amount", args.amount);
  }
  if (args.mint) params.set("mint", args.mint);
  const path = `/api/preauth/open?${params.toString()}`;
  const origin =
    args.origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return origin ? `${origin}${path}` : path;
}

/** GET with apiKey query param (in-app Pay and Shortcuts). */
export async function requestPreauth(args: {
  apiKey: string;
  amount?: string;
  amountUi?: string;
  mint?: string;
}): Promise<PreauthResponse> {
  const apiKey = args.apiKey.trim();
  if (!apiKey) {
    throw new Error("Pay isn't set up on this phone yet.");
  }

  const url = buildPreauthOpenUrl({
    apiKey,
    amount: args.amount,
    amountUi: args.amountUi,
    mint: args.mint,
    origin: "",
  });

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const body = (await res.json()) as PreauthResponse & { error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? `Preauth failed (${res.status})`);
  }
  return body;
}

/** In-app Pay — stored localStorage key → GET open. */
export async function requestPreauthForWallet(args: {
  wallet: string;
  amount?: string;
  amountUi?: string;
  mint?: string;
}): Promise<PreauthResponse> {
  return requestPreauth({
    apiKey: readPayApiKey(args.wallet),
    amount: args.amount,
    amountUi: args.amountUi,
    mint: args.mint,
  });
}

/** Build a Shortcuts open URL from the stored localStorage key. */
export function buildOpenUrlForWallet(args: {
  wallet: string;
  amountUi: string;
  mint?: string;
  origin?: string;
}): string {
  return buildPreauthOpenUrl({
    apiKey: readPayApiKey(args.wallet),
    amountUi: args.amountUi,
    mint: args.mint,
    origin: args.origin,
  });
}

/** Copy a Shortcuts open URL to the clipboard. */
export async function copyPayShortcutLink(args: {
  wallet: string;
  amountUi: string;
  mint?: string;
}): Promise<void> {
  await navigator.clipboard.writeText(buildOpenUrlForWallet(args));
}

/** Cancel — Bearer apiKey. */
export async function cancelPreauth(args: { apiKey: string }): Promise<void> {
  const apiKey = args.apiKey.trim();
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

/** In-app cancel — stored localStorage key → Bearer DELETE. */
export async function cancelPreauthForWallet(args: {
  wallet: string;
}): Promise<void> {
  await cancelPreauth({ apiKey: readPayApiKey(args.wallet) });
}

export type PreauthStatus = { enabled: boolean };

/** Wallet-level Pay enabled (D1). No key material. */
export async function fetchPreauthStatus(wallet: string): Promise<PreauthStatus> {
  const res = await fetch(
    `/api/preauth/status?wallet=${encodeURIComponent(wallet)}`,
    { cache: "no-store" },
  );
  const body = (await res.json().catch(() => ({}))) as PreauthStatus & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Couldn't check Pay status");
  }
  return { enabled: Boolean(body.enabled) };
}
