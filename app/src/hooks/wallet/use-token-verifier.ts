"use client";

import { useQuery } from "@tanstack/react-query";
import { address } from "@solana/kit";
import {
  fetchMaybeTokenVerifier,
  findTokenVerifierPda,
} from "phygital-wallet-sdk";

import { queryKeys, queryOptions } from "@/lib/queries";
import { getSolanaRpc } from "@/lib/solana/rpc";

export type TokenVerifierStatus = {
  /** True when an on-chain TokenVerifier override PDA exists. */
  custom: boolean;
  verifier: string | null;
  endpoint: string | null;
};

/** On-chain token verifier override for a phygital token (signing settings). */
export function useTokenVerifier(phygitalToken: string | null) {
  return useQuery({
    queryKey: queryKeys.tokenVerifier.byToken(phygitalToken),
    queryFn: async (): Promise<TokenVerifierStatus> => {
      const rpc = getSolanaRpc();
      const token = address(phygitalToken!);
      const [pda] = await findTokenVerifierPda({ phygitalToken: token });
      const account = await fetchMaybeTokenVerifier(rpc, pda);
      if (!account.exists) {
        return { custom: false, verifier: null, endpoint: null };
      }
      return {
        custom: true,
        verifier: String(account.data.verifier),
        endpoint: account.data.endpoint || null,
      };
    },
    enabled: Boolean(phygitalToken),
    ...queryOptions.default,
  });
}
