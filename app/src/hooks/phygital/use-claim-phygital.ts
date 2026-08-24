"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TransferSession } from "phygital-token-sdk";

import { captureClaimTap, finishClaim } from "@/lib/phygital/claim";
import type { PhygitalToken } from "@/lib/phygital/token";
import {
  queryKeys,
  setPhygitalTokenOwner,
} from "@/lib/queries";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";

export function useCaptureClaimTap() {
  return useMutation({
    mutationFn: (args: { token: PhygitalToken["address"] }) =>
      captureClaimTap(args),
  });
}

export function useFinishClaim() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: {
      token: Pick<PhygitalToken, "identifier" | "secp256r1PublicKey">;
      session: TransferSession;
      auth: Parameters<typeof finishClaim>[0]["auth"];
      smartWallet: SmartWalletSession;
    }) => {
      await finishClaim({
        session: args.session,
        auth: args.auth,
        smartWallet: args.smartWallet,
      });
      return {
        token: args.token,
        vaultPda: args.smartWallet.vaultPda,
      };
    },
    onSuccess: ({ token, vaultPda }) => {
      setPhygitalTokenOwner(queryClient, token, vaultPda);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.nfcAccessories.byVault(String(vaultPda)),
      });
    },
  });
}
