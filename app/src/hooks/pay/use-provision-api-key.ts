"use client";

import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { signSessionMessage } from "@/lib/lazorkit/sign-message";
import { verifyStoredApiKey } from "@/lib/pay/api-key-client";
import { storeApiKey } from "@/lib/pay/api-key-store";
import { queryFetch } from "@/lib/queries/http";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";

async function provisionApiKey(args: {
  session: SmartWalletSession;
  wallet: string;
}): Promise<string> {
  const message = `phygital-pay:provision:${args.wallet}:${Date.now()}`;
  const proof = await signSessionMessage(args.session, message);

  const res = await queryFetch("/api/preauth/provision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      ...proof,
    }),
  });
  const body = (await res.json()) as { apiKey?: string; error?: string };
  if (!res.ok || !body.apiKey) {
    throw new Error(body.error ?? "Couldn't turn on Pay");
  }
  return body.apiKey;
}

async function provisionAndStoreApiKey(args: {
  session: SmartWalletSession;
  wallet: string;
  rotate?: boolean;
}): Promise<void> {
  if (!args.rotate && (await verifyStoredApiKey(args.wallet))) {
    return;
  }
  storeApiKey(
    args.wallet,
    await provisionApiKey({ session: args.session, wallet: args.wallet }),
  );
}

/** Face ID a provision message, store the issued API key in this browser. */
export function useProvisionApiKey() {
  const { session } = useSmartWallet();

  return {
    async provisionKey(wallet: string, opts?: { rotate?: boolean }) {
      if (!session) throw new Error("Create a passkey first");
      await provisionAndStoreApiKey({
        session,
        wallet,
        rotate: opts?.rotate,
      });
    },
  };
}
