"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchMaybePhygitalTokenByPasskeyClient,
  fetchPhygitalTokenByIdentifierClient,
} from "@/lib/phygital/token-client";
import type { PhygitalToken } from "@/lib/phygital/token";
import { queryKeys, queryOptions } from "@/lib/queries";

/** Load on-chain token by chip identifier (NFC URL `pk`). */
export function usePhygitalToken(identifier: string | null) {
  return useQuery<PhygitalToken, Error>({
    queryKey: queryKeys.phygitalToken.byIdentifier(identifier),
    queryFn: () => {
      if (!identifier) throw new Error("Missing identifier");
      return fetchPhygitalTokenByIdentifierClient(identifier);
    },
    enabled: Boolean(identifier),
    ...queryOptions.volatile,
  });
}

/** Load on-chain token by passkey, or `null` when the PDA has no account yet. */
export function usePhygitalTokenByPasskey(secp256r1PublicKey: string | null) {
  return useQuery<PhygitalToken | null, Error>({
    queryKey: queryKeys.phygitalToken.byPasskey(secp256r1PublicKey),
    queryFn: () => {
      if (!secp256r1PublicKey) throw new Error("Missing passkey");
      return fetchMaybePhygitalTokenByPasskeyClient(secp256r1PublicKey);
    },
    enabled: Boolean(secp256r1PublicKey),
    ...queryOptions.volatile,
  });
}
