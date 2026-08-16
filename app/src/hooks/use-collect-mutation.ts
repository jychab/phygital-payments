"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryKeys } from "@/lib/queries";
import {
  receiveTransfer,
  type ReceiveTransferContext,
} from "@/lib/payments/collect-settle";

type ReceiveVars = {
  recipient: Address;
  rawAmount: bigint;
  mint: Address;
  context?: ReceiveTransferContext;
  onPasskeyComplete?: () => void;
};

/**
 * Collect a tap-authorized payment (passkey + sponsored fee-payer submit).
 * On success, refresh the recipient's history so the new payment appears.
 */
export function useCollectMutation(options?: {
  onSuccess?: (signature: string) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation<{ signature: string }, Error, ReceiveVars>({
    mutationFn: (vars) => receiveTransfer(vars),
    onSuccess: ({ signature }, { recipient }) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.history.byAddress(recipient),
      });
      options?.onSuccess?.(signature);
    },
  });
}
