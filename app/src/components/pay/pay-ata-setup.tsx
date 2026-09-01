"use client";

import { toast } from "sonner";
import { address, type Address } from "@solana/kit";
import { useQueryClient } from "@tanstack/react-query";

import { AtaSetupActions } from "@/components/shared/ata-setup-actions";
import { queryKeys, type MintDelegateStatus } from "@/lib/queries";
import type { PaymentToken } from "@/lib/tokens/payment-token";
import { copy } from "@/lib/copy/phygital";

/** Create the linked wallet's token account. Caller must gate wallet connect. */
export function PayAtaSetup({
  owner,
  tokenAddress,
  mint,
  token,
}: {
  owner: string;
  tokenAddress: string;
  mint: Address;
  token: PaymentToken;
}) {
  const queryClient = useQueryClient();

  return (
    <AtaSetupActions
      expectedOwner={owner}
      recipient={address(owner)}
      mint={mint}
      token={token}
      walletPreVerified
      createLabel={copy.pay.setupTokenAccount(token.symbol)}
      pendingLabel={copy.pay.settingUpTokenAccount}
      setupFailed={copy.pay.setupTokenAccountFailed}
      onSuccess={() => {
        toast.success(copy.pay.setupTokenAccountDone);
        const key = queryKeys.delegateStatus.byOwnerTokenMint(
          owner,
          tokenAddress,
          String(mint),
        );
        const updated = queryClient.setQueryData<MintDelegateStatus>(key, (prev) =>
          prev ? { ...prev, ataExists: true } : prev,
        );
        if (!updated) {
          void queryClient.invalidateQueries({ queryKey: key });
        }
      }}
    />
  );
}
