"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryKeys, type RecipientAtaStatus } from "@/lib/queries";
import { buildCreateRecipientAtaInstructions } from "@/lib/payments/receive";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";

type OptimisticContext = { previous?: RecipientAtaStatus };

/**
 * Create the recipient's USDC token account (connected wallet pays rent). The
 * status flips to "ready" optimistically; rolls back if the tx fails.
 */
export function useCreateAtaMutation(
  mint: Address,
  options?: { onSuccess?: () => void },
) {
  const signer = useWalletKitSigner();
  const queryClient = useQueryClient();

  return useMutation<void, Error, { recipient: Address }, OptimisticContext>({
    mutationFn: async ({ recipient }) => {
      if (!signer) throw new Error("Connect your wallet");
      const { instructions } = await buildCreateRecipientAtaInstructions({
        signer,
        owner: recipient,
      });
      if (instructions.length > 0) {
        await sendTransaction({ instructions, feePayer: signer });
      }
    },
    onMutate: async ({ recipient }) => {
      const key = queryKeys.ataStatus.byOwnerMint(recipient, mint);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<RecipientAtaStatus>(key);
      queryClient.setQueryData<RecipientAtaStatus>(key, (prev) =>
        prev ? { ...prev, exists: true } : prev,
      );
      return { previous };
    },
    onError: (_error, { recipient }, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(
          queryKeys.ataStatus.byOwnerMint(recipient, mint),
          context.previous,
        );
      }
    },
    onSuccess: () => options?.onSuccess?.(),
  });
}
