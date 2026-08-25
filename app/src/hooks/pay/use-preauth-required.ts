"use client";

import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  useSignMessage,
  useWallets,
} from "@privy-io/react-auth/solana";

import { markApiKeyVerified } from "@/hooks/pay/use-verified-api-key";
import { bytesToBase64 } from "@/lib/crypto/base64";
import { readApiKey, storeApiKey } from "@/lib/pay/api-key-store";
import { queryFetch, queryKeys, queryOptions, readJson } from "@/lib/queries";
import {
  REQUIRED_MESSAGE_PREFIX,
  type PreauthPayState,
} from "../../../shared/preauth-required";

async function fetchPreauthPayState(wallet: string): Promise<PreauthPayState> {
  const params = new URLSearchParams({ wallet });
  const apiKey = readApiKey(wallet);
  const res = await queryFetch(`/api/preauth/required?${params.toString()}`, {
    headers: apiKey ? { "x-api-key": apiKey } : undefined,
  });
  return readJson<PreauthPayState>(res, "Couldn’t check confirmation.");
}

/** Confirm Payments flag + whether this browser’s stored key is live (one request). */
export function usePreauthRequired(wallet: string | null) {
  return useQuery({
    queryKey: queryKeys.preauthRequired.byWallet(wallet),
    queryFn: () => {
      if (!wallet) throw new Error("wallet required");
      return fetchPreauthPayState(wallet);
    },
    enabled: Boolean(wallet),
    ...queryOptions.default,
  });
}

export function markPreauthRequired(
  queryClient: QueryClient,
  wallet: string,
  state: PreauthPayState,
) {
  queryClient.setQueryData(queryKeys.preauthRequired.byWallet(wallet), state);
}

/** Wallet-sign to turn Confirm Payments on or off. */
export function useSetPreauthRequired() {
  const queryClient = useQueryClient();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const solanaWallet = wallets[0] ?? null;

  return {
    async setRequired(wallet: string, required: boolean) {
      if (!solanaWallet) throw new Error("Connect your wallet first");
      const action = required ? "on" : "off";
      const message = `${REQUIRED_MESSAGE_PREFIX}${wallet}:${action}:${Date.now()}`;
      const { signature } = await signMessage({
        message: new TextEncoder().encode(message),
        wallet: solanaWallet,
        options: {
          uiOptions: {
            title: required
              ? "Turn On Confirmation"
              : "Turn Off Confirmation",
            description: required
              ? "You’ll press Pay here before a tap goes through."
              : "Payments will go through when you tap, without pressing Pay.",
          },
        },
      });

      const res = await queryFetch("/api/preauth/required", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          required,
          message,
          signature: bytesToBase64(signature),
        }),
      });
      const body = await readJson<{
        required: boolean;
        apiKey?: string;
      }>(
        res,
        required
          ? "Couldn’t turn on confirmation"
          : "Couldn’t turn off confirmation",
      );

      if (body.apiKey) {
        storeApiKey(wallet, body.apiKey);
        markApiKeyVerified(queryClient, wallet);
      }
      markPreauthRequired(queryClient, wallet, {
        required: body.required,
        keyOk: Boolean(body.apiKey || readApiKey(wallet)),
      });
      return body;
    },
  };
}
