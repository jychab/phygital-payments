"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchPhygitalAsset,
  type PhygitalAsset,
} from "@/lib/phygital/asset";
import { queryKeys, queryOptions } from "@/lib/queries";
import { getSolanaRpc } from "@/lib/solana/rpc";

/** Load on-chain asset state for a passkey (`pk`). */
export function usePhygitalAsset(pk: string | null) {
  return useQuery<PhygitalAsset, Error>({
    queryKey: queryKeys.asset.byPk(pk),
    queryFn: () => {
      if (!pk) throw new Error("Missing passkey");
      return fetchPhygitalAsset(getSolanaRpc(), pk);
    },
    enabled: Boolean(pk),
    ...queryOptions.frequent,
  });
}
