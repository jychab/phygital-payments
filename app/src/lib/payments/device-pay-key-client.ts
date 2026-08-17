"use client";

import {
  useSignMessage,
  useWallets,
} from "@privy-io/react-auth/solana";

import { bytesToBase64 } from "@/lib/crypto/base64";
import {
  loadPreauthApiKey,
  storePreauthApiKey,
} from "@/lib/payments/presence-grant-client";

/**
 * Issue a device pay key for `wallet`. Always prompts `signMessage` — call
 * only from an explicit user action that says they will sign a message.
 * Pass `rotate: true` to replace an existing key (invalidates Shortcuts).
 */
export async function provisionDevicePayKey(args: {
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
        title: args.rotate
          ? "Reset payment verifier"
          : "Allow payment verifier",
        description: args.rotate
          ? "This message issues a new payment verifier for this wallet. It does not move funds."
          : "This message sets up a payment verifier for this wallet. It does not move funds.",
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
    throw new Error(body.error ?? "Couldn’t allow the payment verifier");
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
    async provisionKey(wallet: string, opts?: { rotate?: boolean }) {
      if (!solanaWallet) throw new Error("Connect your wallet first");
      return provisionDevicePayKey({
        wallet,
        signMessage,
        solanaWallet,
        rotate: opts?.rotate,
      });
    },
  };
}
