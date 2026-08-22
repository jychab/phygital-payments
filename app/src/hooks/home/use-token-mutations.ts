"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNoopSigner, type Address } from "@solana/kit";
import {
  getRemoveOwnershipInstruction,
  getSetLockStateInstruction,
} from "phygital-token-sdk";

import { queryKeys } from "@/lib/queries";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";

/**
 * Toggle lock on a Controlled phygital token.
 */
export function useSetLockStateMutation(owner: string | null) {
  const { session } = useSmartWallet();
  const queryClient = useQueryClient();
  const key = queryKeys.phygitalToken.byOwner(owner);

  return useMutation<string, Error, { token: Address; isLocked: boolean }>({
    mutationFn: async ({ token, isLocked }) => {
      if (!session) throw new Error("Create a passkey first");
      const sent = await executeAsVault({
        session,
        inner: [
          getSetLockStateInstruction({
            owner: createNoopSigner(session.vaultPda),
            token,
            isLocked,
          }),
        ],
      });
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.phygitalToken.byAddress(String(token)),
      });
      return sent.signature;
    },
  });
}

/**
 * Forfeit ownership of a token.
 */
export function useRemoveOwnershipMutation(owner: string | null) {
  const { session } = useSmartWallet();
  const queryClient = useQueryClient();
  const key = queryKeys.phygitalToken.byOwner(owner);

  return useMutation<string, Error, { token: Address }>({
    mutationFn: async ({ token }) => {
      if (!session) throw new Error("Create a passkey first");
      const sent = await executeAsVault({
        session,
        inner: [
          getRemoveOwnershipInstruction({
            owner: createNoopSigner(session.vaultPda),
            token,
          }),
        ],
      });
      void queryClient.invalidateQueries({ queryKey: key });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.phygitalToken.byAddress(String(token)),
      });
      return sent.signature;
    },
  });
}
