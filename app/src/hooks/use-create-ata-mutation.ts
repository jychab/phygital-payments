"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryKeys, type RecipientAtaStatus } from "@/lib/queries";
import { buildCreateRecipientAtaInstructions } from "@/lib/payments/collect-settle";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";

/**
 * Create the recipient's USDC token account (connected wallet pays rent).
 * Status flips to ready after broadcast; confirm refreshes or rolls back.
 */
export function useCreateAtaMutation(
  mint: Address,
  options?: { onSuccess?: () => void },
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recipient: Address }>({
    mutationFn: async ({ recipient }) => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildCreateRecipientAtaInstructions({
        signer,
        mint,
        owner: recipient,
      });
      if (instructions.length === 0) return;

      const key = queryKeys.ataStatus.byOwnerMint(recipient, mint);
      const sent = await sendTransaction({ instructions, feePayer: signer });
      const previous = queryClient.getQueryData<RecipientAtaStatus>(key);
      queryClient.setQueryData<RecipientAtaStatus>(key, (prev) =>
        prev ? { ...prev, exists: true } : prev,
      );
      try {
        await sent.confirmed;
      } catch (error) {
        if (previous !== undefined) queryClient.setQueryData(key, previous);
        throw error;
      }
      void queryClient.invalidateQueries({ queryKey: key });
    },
    onSuccess: () => options?.onSuccess?.(),
  });
}
