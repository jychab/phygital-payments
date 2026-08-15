"use client";

import {
  useSignMessage,
  useWallets,
} from "@privy-io/react-auth/solana";

import { bytesToBase64 } from "@/lib/crypto/base64";
import {
  loadPreauthApiKey,
  storePreauthApiKey,
} from "@/lib/payments/preauth-client";

/**
 * Ensure this device has a pay key for `wallet`. Signs a short proof once,
 * stores the key locally. Pass `rotate: true` to issue a new key (invalidates
 * the previous one and any Shortcuts that still use it).
 */
export async function ensureDevicePayKey(args: {
  wallet: string;
  signMessage: ReturnType<typeof useSignMessage>["signMessage"];
  solanaWallet: NonNullable<ReturnType<typeof useWallets>["wallets"][number]>;
  /** When true, always provision a new key even if one is stored locally. */
  rotate?: boolean;
}): Promise<string> {
  if (!args.rotate) {
    const existing = loadPreauthApiKey(args.wallet);
    if (existing) return existing;
  }

  const message = `phygital-pay:provision:${args.wallet}:${Date.now()}`;
  const { signature } = await args.signMessage({
    message: new TextEncoder().encode(message),
    wallet: args.solanaWallet,
    options: {
      uiOptions: {
        title: args.rotate ? "Rotate Pay API key" : "Enable Pay on this device",
      },
    },
  });

  const res = await fetch("/api/preauth/provision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: args.wallet,
      message,
      signature: bytesToBase64(signature),
    }),
  });
  const body = (await res.json()) as { apiKey?: string; error?: string };
  if (!res.ok || !body.apiKey) {
    throw new Error(body.error ?? "Couldn’t enable Pay on this device");
  }
  storePreauthApiKey(body.apiKey, args.wallet);
  return body.apiKey;
}

export function useDevicePayKeyHelpers() {
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const solanaWallet = wallets[0] ?? null;

  return {
    solanaWallet,
    async ensureKey(wallet: string, opts?: { rotate?: boolean }) {
      if (!solanaWallet) throw new Error("Connect your wallet first");
      return ensureDevicePayKey({
        wallet,
        signMessage,
        solanaWallet,
        rotate: opts?.rotate,
      });
    },
  };
}
