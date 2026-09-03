"use client";

import { useQuery } from "@tanstack/react-query";
import { address } from "@solana/kit";

import {
  fetchPhygitalToken,
  fetchPhygitalTokenByIdentifier,
  type PhygitalToken,
} from "@/lib/phygital/token";
import { queryKeys, queryOptions } from "@/lib/queries";
import { getSolanaRpc } from "@/lib/solana/rpc";

/** Load on-chain token by chip identifier (NFC URL `pk`). */
export function usePhygitalToken(identifier: string | null) {
  return useQuery<PhygitalToken, Error>({
    queryKey: queryKeys.phygitalToken.byIdentifier(identifier),
    queryFn: () => {
      if (!identifier) throw new Error("Missing identifier");
      return fetchPhygitalTokenByIdentifier(getSolanaRpc(), identifier);
    },
    enabled: Boolean(identifier),
    ...queryOptions.volatile,
  });
}

/** Load on-chain token by PDA. */
export function usePhygitalTokenByAddress(tokenAddress: string | null) {
  return useQuery<PhygitalToken, Error>({
    queryKey: queryKeys.phygitalToken.byAddress(tokenAddress),
    queryFn: () => {
      if (!tokenAddress) throw new Error("Missing token");
      return fetchPhygitalToken(getSolanaRpc(), address(tokenAddress));
    },
    enabled: Boolean(tokenAddress),
    ...queryOptions.volatile,
  });
}
