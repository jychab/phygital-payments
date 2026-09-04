"use client";

import { useQuery } from "@tanstack/react-query";
import { address } from "@solana/kit";
import {
  fetchMaybeRecoveryWallet,
  findRecoveryWalletAccountPda,
} from "phygital-wallet-sdk";

import { queryKeys, queryOptions } from "@/lib/queries";
import { getSolanaRpc } from "@/lib/solana/rpc";

export type RecoveryWalletStatus = {
  configured: boolean;
  recoveryWallet: string | null;
  payer: string | null;
};

/** On-chain recovery wallet PDA for a phygital token (owner settings). */
export function useRecoveryWallet(phygitalToken: string | null) {
  return useQuery({
    queryKey: queryKeys.recoveryWallet.byToken(phygitalToken),
    queryFn: async (): Promise<RecoveryWalletStatus> => {
      const rpc = getSolanaRpc();
      const token = address(phygitalToken!);
      const [pda] = await findRecoveryWalletAccountPda({
        phygitalToken: token,
      });
      const account = await fetchMaybeRecoveryWallet(rpc, pda);
      if (!account.exists) {
        return { configured: false, recoveryWallet: null, payer: null };
      }
      return {
        configured: true,
        recoveryWallet: String(account.data.recoveryWallet),
        payer: String(account.data.payer),
      };
    },
    enabled: Boolean(phygitalToken),
    ...queryOptions.default,
  });
}
