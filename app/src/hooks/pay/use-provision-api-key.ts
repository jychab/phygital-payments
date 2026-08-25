"use client";

import {
  useSignMessage,
  useWallets,
} from "@privy-io/react-auth/solana";

import { bytesToBase64 } from "@/lib/crypto/base64";
import { verifyStoredApiKey } from "@/lib/pay/api-key-client";
import { storeApiKey } from "@/lib/pay/api-key-store";
import { QueryHttpError, queryFetch } from "@/lib/queries/http";

type ProvisionArgs = {
  wallet: string;
  signMessage: ReturnType<typeof useSignMessage>["signMessage"];
  solanaWallet: NonNullable<ReturnType<typeof useWallets>["wallets"][number]>;
  rotate?: boolean;
};

async function provisionApiKey(args: ProvisionArgs): Promise<string> {
  const message = `phygital-pay:provision:${args.wallet}:${Date.now()}`;
  const { signature } = await args.signMessage({
    message: new TextEncoder().encode(message),
    wallet: args.solanaWallet,
    options: {
      uiOptions: {
        title: args.rotate ? "Rotate API key" : "Generate API key",
        description: args.rotate
          ? "Other browsers will stop working. This does not move funds."
          : "Revibase Pay will work in this browser. This does not move funds.",
      },
    },
  });

  const res = await queryFetch("/api/preauth/provision", {
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
    throw new QueryHttpError(
      body.error ?? "Couldn't turn on Pay",
      res.status,
    );
  }
  return body.apiKey;
}

async function provisionAndStoreApiKey(
  args: ProvisionArgs,
): Promise<void> {
  if (!args.rotate && (await verifyStoredApiKey(args.wallet))) {
    return;
  }
  storeApiKey(args.wallet, await provisionApiKey(args));
}

/** Wallet-sign a provision message, store the issued API key in this browser. */
export function useProvisionApiKey() {
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const solanaWallet = wallets[0] ?? null;

  return {
    async provisionKey(wallet: string, opts?: { rotate?: boolean }) {
      if (!solanaWallet) throw new Error("Connect your wallet first");
      await provisionAndStoreApiKey({
        wallet,
        signMessage,
        solanaWallet,
        rotate: opts?.rotate,
      });
    },
  };
}
