"use client";

import { useQuery } from "@tanstack/react-query";
import { address } from "@solana/kit";

import {
  fetchMaybePhygitalTokenByPasskey,
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
    ...queryOptions.default,
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
    ...queryOptions.default,
  });
}

/** Load on-chain token by passkey, or `null` when the PDA has no account yet. */
export function usePhygitalTokenByPasskey(secp256r1PublicKey: string | null) {
  return useQuery<PhygitalToken | null, Error>({
    queryKey: queryKeys.phygitalToken.byPasskey(secp256r1PublicKey),
    queryFn: () => {
      if (!secp256r1PublicKey) throw new Error("Missing passkey");
      return fetchMaybePhygitalTokenByPasskey(
        getSolanaRpc(),
        secp256r1PublicKey,
      );
    },
    enabled: Boolean(secp256r1PublicKey),
    ...queryOptions.default,
  });
}
