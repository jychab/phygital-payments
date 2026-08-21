/**
 * React Query keys, fetchers, and staleTime presets.
 *
 * Browser HTTP always goes through `queryFetch` (`cache: "no-store"`).
 * React Query is the only client cache; API GET routes send
 * `Cache-Control: private, no-store`.
 *
 * Domain code lives next to the matching UI folder:
 *   lib/pay + hooks/pay         This Browser (Pay key), Hold to Pay, limits
 *   lib/collect + hooks/collect `/collect` receive + ATA setup
 *   lib/accessory + hooks/accessory  NFC tap, Hold to Check, claim, `/accessory?token=`
 *   lib/home + hooks/home       Activity + Accessories tab
 *   lib/tokens + hooks/tokens   mint catalog, holdings (`use-payment-tokens`)
 *   lib/server                  API routes only (`import "server-only"`)
 *   hooks/wallet                Privy address, expected-wallet match, query refresh
 *   hooks/layout                iframe / in-app browser
 */

import type { Address } from "@solana/kit";
import type { QueryClient } from "@tanstack/react-query";

import {
  fetchMintDelegateStatus,
  fetchOwnerPayDelegates,
  resolveMintProgram,
  type MintDelegateStatus,
  type OwnerPayDelegates,
  type TokenProgram,
} from "@/lib/tokens/mint-delegate";
import {
  fetchRecipientAtaStatus,
  type RecipientAtaStatus,
} from "@/lib/collect/collect-settle";
import {
  fetchPaymentHistory,
  type PaymentRecord,
} from "@/lib/home/history-client";
import {
  fetchHoldingsClient,
  fetchVerifiedTokensClient,
} from "@/lib/tokens/verified-tokens-client";
import { fetchDasCollectibleClient } from "@/lib/tokens/das-collectible-client";
import type { Collectible } from "@/lib/tokens/collectible";
import type {
  PaymentToken,
  PaymentTokenHolding,
} from "@/lib/tokens/payment-token";

export { queryFetch, readJson } from "./http";

// ============================================================================
// Query keys
// ============================================================================

export const queryKeys = {
  delegateStatus: {
    all: () => ["delegateStatus"] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.delegateStatus.all(), owner] as const,
    byOwnerToken: (owner: string | null, token: string | null) =>
      [...queryKeys.delegateStatus.byOwner(owner), token] as const,
    byOwnerTokenMint: (
      owner: string | null,
      token: string | null,
      mint: string | null,
    ) =>
      [...queryKeys.delegateStatus.byOwnerToken(owner, token), mint] as const,
  },

  ownerPayDelegates: {
    all: () => ["ownerPayDelegates"] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.ownerPayDelegates.all(), owner] as const,
  },

  holdings: {
    all: () => ["holdings"] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.holdings.all(), owner] as const,
  },

  verifiedTokens: {
    all: () => ["verifiedTokens"] as const,
  },

  dasCollectible: {
    all: () => ["dasCollectible"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.dasCollectible.all(), mint] as const,
  },

  ataStatus: {
    all: () => ["ataStatus"] as const,
    byOwnerMint: (owner: string | null, mint: string | null) =>
      [...queryKeys.ataStatus.all(), owner, mint] as const,
  },

  mintProgram: {
    all: () => ["mintProgram"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.mintProgram.all(), mint] as const,
  },

  history: {
    all: () => ["history"] as const,
    byAddress: (address: string | null) =>
      [...queryKeys.history.all(), address] as const,
  },

  tapVerify: {
    all: () => ["tapVerify"] as const,
    byParams: (params: string) =>
      [...queryKeys.tapVerify.all(), params] as const,
  },

  pendingClaim: {
    all: () => ["pendingClaim"] as const,
    byToken: (token: string | null) =>
      [...queryKeys.pendingClaim.all(), token] as const,
  },

  apiKey: {
    all: () => ["apiKey"] as const,
    byWallet: (wallet: string | null) =>
      [...queryKeys.apiKey.all(), wallet] as const,
  },

  phygitalToken: {
    all: () => ["phygitalTokens"] as const,
    byIdentifier: (identifier: string | null) =>
      [...queryKeys.phygitalToken.all(), "identifier", identifier] as const,
    byPasskey: (secp256r1PublicKey: string | null) =>
      [...queryKeys.phygitalToken.all(), "passkey", secp256r1PublicKey] as const,
    byAddress: (token: string | null) =>
      [...queryKeys.phygitalToken.all(), "address", token] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.phygitalToken.all(), "owner", owner] as const,
  },
};

/** Owner-scoped reads the user can force-refresh while staleTime hasn't elapsed. */
export function isOwnerDataQuery(
  queryKey: readonly unknown[],
  owner: string,
): boolean {
  const root = queryKey[0];
  if (
    root === "holdings" ||
    root === "delegateStatus" ||
    root === "ownerPayDelegates" ||
    root === "history"
  ) {
    return queryKey[1] === owner;
  }
  if (root === "phygitalTokens") {
    return queryKey[1] === "owner" && queryKey[2] === owner;
  }
  return false;
}

export function invalidateOwnerQueries(
  queryClient: QueryClient,
  owner: string,
): void {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.holdings.byOwner(owner),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.delegateStatus.byOwner(owner),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.ownerPayDelegates.byOwner(owner),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.history.byAddress(owner),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.phygitalToken.byOwner(owner),
  });
}

// ============================================================================
// Option presets (staleTime tuned per data volatility)
// ============================================================================

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const queryOptions = {
  /**
   * Balances, remaining limits, recent activity.
   * Always stale so mount/focus/reconnect refetch; poll while the screen is
   * open (NFC taps happen off-app and cannot invalidate the cache).
   */
  live: {
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 60 * SECOND,
  },
  /** Changes after user actions; mutations already invalidate. */
  default: { refetchOnWindowFocus: false, staleTime: 5 * MINUTE },
  /** Catalog / rarely changing metadata. */
  stable: { refetchOnWindowFocus: false, staleTime: 15 * MINUTE },
  /** One-shot proofs / immutable chain metadata — never refetch. */
  immutable: { refetchOnWindowFocus: false, staleTime: Infinity },
} as const;

/** Owner-scoped reads: poll only while the UI surface is active. */
export function ownerQueryOptions(live: boolean) {
  return live ? queryOptions.live : queryOptions.default;
}

// ============================================================================
// Fetchers (reuse the existing domain functions)
// ============================================================================

export type MintProgramInfo = { program: TokenProgram; decimals: number };

export function fetchMintProgram(mint: Address): Promise<MintProgramInfo> {
  return resolveMintProgram(mint);
}

export function fetchDelegateStatus(
  owner: Address,
  mint: Address,
  token: Address,
): Promise<MintDelegateStatus> {
  return fetchMintDelegateStatus(owner, mint, token);
}

export { fetchOwnerPayDelegates };

export function fetchAtaStatus(args: {
  owner: Address;
  mint: Address;
  program?: TokenProgram;
}): Promise<RecipientAtaStatus> {
  return fetchRecipientAtaStatus(args);
}

export function fetchHistory(address: string): Promise<PaymentRecord[]> {
  return fetchPaymentHistory(address, { limit: 50 });
}

export function fetchVerifiedTokens(): Promise<PaymentToken[]> {
  return fetchVerifiedTokensClient();
}

export function fetchHoldings(owner: string): Promise<PaymentTokenHolding[]> {
  return fetchHoldingsClient(owner);
}

export function fetchDasCollectible(mint: string): Promise<Collectible | null> {
  return fetchDasCollectibleClient(mint);
}

export type {
  Collectible,
  MintDelegateStatus,
  OwnerPayDelegates,
  RecipientAtaStatus,
  TokenProgram,
  PaymentRecord,
  PaymentToken,
  PaymentTokenHolding,
};
