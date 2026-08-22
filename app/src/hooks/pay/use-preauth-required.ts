"use client";

import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";

import { markApiKeyVerified } from "@/hooks/pay/use-verified-api-key";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { signSessionMessage } from "@/lib/lazorkit/sign-message";
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

/** Confirm Payments flag + whether this phone’s stored key is live (one request). */
export function usePreauthRequired(wallet: string | null) {
  return useQuery({
    queryKey: queryKeys.preauthRequired.byWallet(wallet),
    queryFn: () => {
      if (!wallet) throw new Error("wallet required");
      return fetchPreauthPayState(wallet);
    },
    enabled: Boolean(wallet),
    ...queryOptions.default,
    retry: false,
  });
}

export function markPreauthRequired(
  queryClient: QueryClient,
  wallet: string,
  state: PreauthPayState,
) {
  queryClient.setQueryData(queryKeys.preauthRequired.byWallet(wallet), state);
}

/** Face ID to turn Confirm Payments on or off. */
export function useSetPreauthRequired() {
  const queryClient = useQueryClient();
  const { session } = useSmartWallet();

  return {
    async setRequired(wallet: string, required: boolean) {
      if (!session) throw new Error("Create a passkey first");
      const action = required ? "on" : "off";
      const message = `${REQUIRED_MESSAGE_PREFIX}${wallet}:${action}:${Date.now()}`;
      const proof = await signSessionMessage(session, message);

      const res = await queryFetch("/api/preauth/required", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          required,
          message,
          ...proof,
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
