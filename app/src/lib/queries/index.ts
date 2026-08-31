/**
 * React Query keys, fetchers, and staleTime presets.
 *
 * Browser HTTP always goes through `queryFetch` (`cache: "no-store"`).
 * React Query is the only client cache; API GET routes send
 * `Cache-Control: private, no-store`.
 *
 * Domain code lives next to the matching UI folder:
 *   lib/pay + hooks/pay         This Browser (Pay key), Hold to Pay, limits,
 *                               Pay bootstrap (holdings ∩ delegates)
 *   lib/collect + hooks/collect `/collect` receive + ATA setup
 *   lib/token + hooks/token          NFC tap, Hold to Check, claim, `/token`
 *   lib/phygital                     Phygital token account helpers
 *   lib/home + hooks/home       Collection hub + Activity
 *   lib/tokens + hooks/tokens   mint catalog, holdings (`use-payment-tokens`)
 *   lib/server                  API routes only (`import "server-only"`)
 *   hooks/wallet                ConnectorKit address, expected-wallet match, query refresh
 *   hooks/layout                iframe / in-app browser
 */

import type { Address } from "@solana/kit";
import type { QueryClient } from "@tanstack/react-query";

import {
  fetchMintDelegateStatus,
  resolveMintProgram,
  type MintDelegateStatus,
  type OwnerPayDelegates,
  type TokenProgram,
} from "@/lib/tokens/mint-delegate";
import { fetchPayBootstrapClient } from "@/lib/pay/pay-bootstrap-client";
import type { PayBootstrap } from "@/lib/pay/pay-bootstrap-wire";
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
import { fetchDasCollectibleClient, fetchDasCollectiblesClient } from "@/lib/tokens/das-collectible-client";
import { fetchMintedCollectibleViewClient } from "@/lib/tokens/minted-collectible-view-client";
import { fetchCollectibleRarityClient } from "@/lib/tokens/rarity-client";
import type { Collectible, CollectibleRarity } from "@/lib/tokens/collectible";
import { fetchCollectibleShortcutsClient } from "@/lib/tokens/shortcuts-client";
import type { CollectibleShortcut } from "@/lib/tokens/shortcuts";
import type {
  PaymentToken,
  PaymentTokenHolding,
} from "@/lib/tokens/payment-token";

export {
  queryFetch,
  readJson,
  QueryHttpError,
  getQueryErrorStatus,
  isRetryableQueryError,
  shouldRetryQuery,
} from "./http";


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
    batch: (mints: string[]) =>
      [...queryKeys.dasCollectible.all(), "batch", ...mints] as const,
  },

  collectibleRarity: {
    all: () => ["collectibleRarity"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.collectibleRarity.all(), mint] as const,
  },

  mintedCollectibleView: {
    all: () => ["mintedCollectibleView"] as const,
    byMint: (mint: string | null) =>
      [...queryKeys.mintedCollectibleView.all(), mint] as const,
  },

  collectibleShortcuts: {
    all: () => ["collectibleShortcuts"] as const,
    byExternalUrl: (
      externalUrl: string | null,
      collectionMint: string | null,
    ) =>
      [
        ...queryKeys.collectibleShortcuts.all(),
        externalUrl,
        collectionMint,
      ] as const,
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

  apiKey: {
    all: () => ["apiKey"] as const,
    byWallet: (wallet: string | null) =>
      [...queryKeys.apiKey.all(), wallet] as const,
  },

  preauthRequired: {
    all: () => ["preauthRequired"] as const,
    byWallet: (wallet: string | null) =>
      [...queryKeys.preauthRequired.all(), wallet] as const,
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
    root === "history" ||
    root === "preauthRequired"
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

/** Token account reads keyed by address / identifier / passkey / owner. */
export function invalidatePhygitalTokenQueries(
  queryClient: QueryClient,
  token: {
    address: string;
    identifier: string;
    secp256r1PublicKey: string;
    currentOwner?: string | null;
  },
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.byAddress(token.address),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.byIdentifier(token.identifier),
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.byPasskey(token.secp256r1PublicKey),
    }),
    token.currentOwner
      ? queryClient.invalidateQueries({
          queryKey: queryKeys.phygitalToken.byOwner(token.currentOwner),
        })
      : Promise.resolve(),
  ]).then(() => undefined);
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
  /**
   * Owner collection list on `/`. Soft freshness: show cached paint, refetch
   * on focus/reconnect, but skip remount churn while still fresh (30s).
   * Mutations still invalidate via invalidateOwnerQueries.
   */
  ownerList: {
    staleTime: 30 * SECOND,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  /**
   * Ownership / token accounts that change in another browser (wallet IAB)
   * or via an NFC tap that cannot invalidate this tab's cache. Persist may
   * paint instantly; always refetch on mount/focus/reconnect.
   */
  volatile: {
    staleTime: 0,
    refetchOnMount: "always" as const,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },
  /** Changes after user actions; mutations already invalidate. */
  default: { refetchOnWindowFocus: false, staleTime: 5 * MINUTE },
  /** Catalog / rarely changing metadata. */
  stable: { refetchOnWindowFocus: false, staleTime: 15 * MINUTE },
  /** One-shot proofs / immutable chain metadata — never refetch. */
  immutable: {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: Infinity,
  },
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

export function fetchPayBootstrap(owner: string): Promise<PayBootstrap> {
  return fetchPayBootstrapClient(owner);
}

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

export function fetchDasCollectibles(
  mints: string[],
): Promise<Record<string, Collectible | null>> {
  return fetchDasCollectiblesClient(mints);
}

export async function fetchCollectibleRarity(
  mint: string,
): Promise<CollectibleRarity | null> {
  const res = await fetchCollectibleRarityClient(mint);
  return res.rarity;
}

export function fetchMintedCollectibleView(mint: string) {
  return fetchMintedCollectibleViewClient(mint);
}

export function fetchCollectibleShortcuts(
  externalUrl: string,
  collectionMint: string | null,
): Promise<CollectibleShortcut[]> {
  return fetchCollectibleShortcutsClient(externalUrl, collectionMint);
}

export type {
  Collectible,
  CollectibleRarity,
  CollectibleShortcut,
  MintDelegateStatus,
  OwnerPayDelegates,
  PayBootstrap,
  RecipientAtaStatus,
  TokenProgram,
  PaymentRecord,
  PaymentToken,
  PaymentTokenHolding,
};
