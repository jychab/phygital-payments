"use client";

import { useQuery } from "@tanstack/react-query";
import { address } from "@solana/kit";

import {
  fetchPhygitalAssetsByOwner,
  type PhygitalAsset,
} from "@/lib/phygital/asset";
import { queryKeys, queryOptions } from "@/lib/queries";
import { getSolanaRpc } from "@/lib/solana/rpc";

/** Load all on-chain assets owned by a wallet. */
export function usePhygitalAssetsByOwner(owner: string | null) {
  return useQuery<PhygitalAsset[], Error>({
    queryKey: queryKeys.asset.byOwner(owner),
    queryFn: () => {
      if (!owner) throw new Error("Missing owner");
      return fetchPhygitalAssetsByOwner(getSolanaRpc(), address(owner));
    },
    enabled: Boolean(owner),
    ...queryOptions.frequent,
  });
}
