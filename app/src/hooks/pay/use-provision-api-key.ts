"use client";

import { bytesToBase64 } from "@/lib/crypto/base64";
import { verifyStoredApiKey } from "@/lib/pay/api-key-client";
import { storeApiKey } from "@/lib/pay/api-key-store";
import { QueryHttpError, queryFetch } from "@/lib/queries/http";
import { useWalletSignMessage } from "@/hooks/wallet/use-wallet-sign-message";

type ProvisionArgs = {
  wallet: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  rotate?: boolean;
};

async function provisionApiKey(args: ProvisionArgs): Promise<string> {
  const message = `phygital-pay:provision:${args.wallet}:${Date.now()}`;
  const signature = await args.signMessage(
    new TextEncoder().encode(message),
  );

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
  const { signMessage } = useWalletSignMessage();

  return {
    async provisionKey(wallet: string, opts?: { rotate?: boolean }) {
      await provisionAndStoreApiKey({
        wallet,
        signMessage,
        rotate: opts?.rotate,
      });
    },
  };
}
