"use client";

import {
  useSignMessage,
  useWallets,
} from "@privy-io/react-auth/solana";

import {
  hasEncryptedPreauthApiKey,
  sealPreauthApiKey,
} from "@/lib/crypto/prf-key-vault";
import { bytesToBase64 } from "@/lib/crypto/base64";

/**
 * Issue a Pay key for `wallet` via wallet sign-message (server provision).
 * Does not seal — call sealPreauthApiKey after, or use provisionAndSealPayKey.
 */
export async function provisionDevicePayKey(args: {
  wallet: string;
  signMessage: ReturnType<typeof useSignMessage>["signMessage"];
  solanaWallet: NonNullable<ReturnType<typeof useWallets>["wallets"][number]>;
  rotate?: boolean;
}): Promise<string> {
  const message = `phygital-pay:provision:${args.wallet}:${Date.now()}`;
  const { signature } = await args.signMessage({
    message: new TextEncoder().encode(message),
    wallet: args.solanaWallet,
    options: {
      uiOptions: {
        title: args.rotate ? "Reset Pay" : "Enable Pay",
        description:
          "This message turns on Pay for this wallet. It does not move funds.",
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
    throw new Error(body.error ?? "Couldn't enable Pay");
  }
  return body.apiKey;
}

/** Sign message → server key → Face ID seal. */
export async function provisionAndSealPayKey(args: {
  wallet: string;
  signMessage: ReturnType<typeof useSignMessage>["signMessage"];
  solanaWallet: NonNullable<ReturnType<typeof useWallets>["wallets"][number]>;
  rotate?: boolean;
}): Promise<void> {
  if (!args.rotate && hasEncryptedPreauthApiKey(args.wallet)) {
    return;
  }
  const apiKey = await provisionDevicePayKey(args);
  await sealPreauthApiKey(args.wallet, apiKey);
}

export function useDevicePayKeyHelpers() {
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const solanaWallet = wallets[0] ?? null;

  return {
    solanaWallet,
    async provisionKey(wallet: string, opts?: { rotate?: boolean }) {
      if (!solanaWallet) throw new Error("Connect your wallet first");
      await provisionAndSealPayKey({
        wallet,
        signMessage,
        solanaWallet,
        rotate: opts?.rotate,
      });
    },
  };
}
