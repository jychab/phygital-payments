/**
 * React Query keys, fetchers, and staleTime presets.
 * Browser HTTP goes through `queryFetch`; React Query owns freshness.
 */

import type { QueryClient } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import type { Collectible } from "@/lib/tokens/collectible";
import type { PhygitalToken } from "@/lib/phygital/token";

export { queryFetch, readJson } from "./http";

export const queryKeys = {
  dasCollectible: {
    all: () => ["dasCollectible"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.dasCollectible.all(), mint] as const,
  },

  tapVerify: {
    all: () => ["tapVerify"] as const,
    byParams: (params: string) =>
      [...queryKeys.tapVerify.all(), params] as const,
  },

  phygitalToken: {
    all: () => ["phygitalTokens"] as const,
    byIdentifier: (identifier: string | null) =>
      [...queryKeys.phygitalToken.all(), "identifier", identifier] as const,
    byPasskey: (secp256r1PublicKey: string | null) =>
      [...queryKeys.phygitalToken.all(), "passkey", secp256r1PublicKey] as const,
  },

  walletPortfolio: {
    all: () => ["walletPortfolio"] as const,
    byVault: (vault: string | null) =>
      [...queryKeys.walletPortfolio.all(), vault] as const,
  },

  walletDashboard: {
    all: () => ["walletDashboard"] as const,
    byVault: (vault: string | null) =>
      [...queryKeys.walletDashboard.all(), vault] as const,
  },

  agentSession: {
    all: () => ["agentSession"] as const,
    byVault: (vault: string | null) =>
      [...queryKeys.agentSession.all(), vault] as const,
  },

  nfcAccessories: {
    all: () => ["nfcAccessories"] as const,
    byVault: (vault: string | null) =>
      [...queryKeys.nfcAccessories.all(), vault] as const,
  },

  walletActivity: {
    all: () => ["walletActivity"] as const,
    byVault: (vault: string | null) =>
      [...queryKeys.walletActivity.all(), vault] as const,
  },
};

/** Token account reads keyed by identifier / passkey. */
export function invalidatePhygitalTokenQueries(
  queryClient: QueryClient,
  token: {
    identifier: string;
    secp256r1PublicKey: string;
  },
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.byIdentifier(token.identifier),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.byPasskey(token.secp256r1PublicKey),
    }),
  ]).then(() => undefined);
}

export function setPhygitalTokenOwner(
  queryClient: QueryClient,
  token: Pick<PhygitalToken, "identifier" | "secp256r1PublicKey">,
  currentOwner: Address,
): void {
  patchPhygitalToken(queryClient, token, (prev) => ({
    ...prev,
    currentOwner,
  }));
}

export function setPhygitalTokenLocked(
  queryClient: QueryClient,
  token: Pick<PhygitalToken, "identifier" | "secp256r1PublicKey">,
  isLocked: boolean,
): void {
  patchPhygitalToken(queryClient, token, (prev) => ({ ...prev, isLocked }));
}

function patchPhygitalToken(
  queryClient: QueryClient,
  token: Pick<PhygitalToken, "identifier" | "secp256r1PublicKey">,
  patch: (prev: PhygitalToken) => PhygitalToken,
): void {
  const apply = (prev: PhygitalToken | null | undefined) =>
    prev ? patch(prev) : prev;
  queryClient.setQueryData(
    queryKeys.phygitalToken.byIdentifier(token.identifier),
    apply,
  );
  queryClient.setQueryData(
    queryKeys.phygitalToken.byPasskey(token.secp256r1PublicKey),
    apply,
  );
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/** Per-domain React Query defaults. Prefer these over ad-hoc staleTimes. */
export const queryOptions = {
  default: { refetchOnWindowFocus: false, staleTime: 5 * MINUTE },
  /** Phygital ownership can change via NFC off-tab; always refetch. */
  volatile: {
    staleTime: 30 * SECOND,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  /** Balances/history — mutations invalidate; focus catches inbound. */
  wallet: {
    staleTime: 60 * SECOND,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
  /** Agent grants — mutation-invalidated only. */
  agent: {
    staleTime: 60 * SECOND,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  },
  /** NFT metadata — rarely changes after mint. */
  stable: { refetchOnWindowFocus: false, staleTime: 15 * MINUTE },
  /** One-shot NFC tap proofs. */
  immutable: { refetchOnWindowFocus: false, staleTime: Infinity },
} as const;

export type { Collectible };
