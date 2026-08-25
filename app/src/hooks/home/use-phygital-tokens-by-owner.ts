"use client";

import { useQuery } from "@tanstack/react-query";
import { address } from "@solana/kit";

import {
  fetchPhygitalTokensByOwner,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { queryKeys, queryOptions } from "@/lib/queries";
import { getSolanaRpc } from "@/lib/solana/rpc";

/** Load all on-chain phygital tokens owned by a wallet. */
export function usePhygitalTokensByOwner(owner: string | null) {
  return useQuery<PhygitalToken[], Error>({
    queryKey: queryKeys.phygitalToken.byOwner(owner),
    queryFn: () => {
      if (!owner) throw new Error("Missing owner");
      return fetchPhygitalTokensByOwner(getSolanaRpc(), address(owner));
    },
    enabled: Boolean(owner),
    ...queryOptions.ownerList,
  });
}
