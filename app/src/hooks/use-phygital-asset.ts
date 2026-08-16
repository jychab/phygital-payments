"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchPhygitalAssetByIdentifier,
  type PhygitalAsset,
} from "@/lib/phygital/asset";
import { queryKeys, queryOptions } from "@/lib/queries";
import { getSolanaRpc } from "@/lib/solana/rpc";

/** Load on-chain asset by chip identifier (NFC URL `pk`). */
export function usePhygitalAsset(identifier: string | null) {
  return useQuery<PhygitalAsset, Error>({
    queryKey: queryKeys.asset.byIdentifier(identifier),
    queryFn: () => {
      if (!identifier) throw new Error("Missing identifier");
      return fetchPhygitalAssetByIdentifier(getSolanaRpc(), identifier);
    },
    enabled: Boolean(identifier),
    ...queryOptions.frequent,
  });
}
