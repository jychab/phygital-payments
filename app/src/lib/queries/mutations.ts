/**
 * Post-mutation cache updates for React Query.
 *
 * Prefer invalidate for chain/API-derived balances (fees credit async via
 * webhook; portfolio shapes are hard to patch safely). Prefer setQueryData
 * only when the client already knows the exact next value (policy PUT).
 */

import type { QueryClient } from "@tanstack/react-query";

import type { PolicySummary } from "@/lib/wallet/policies-client";

import { queryKeys } from "./keys";

function uniq(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

function cachedTokenAddress(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("address" in data)) return null;
  const address = (data as { address: unknown }).address;
  return address == null ? null : String(address);
}

/** Portfolio + fee balance after a send, receive, or fee top-up. */
export function invalidateWalletBalances(
  queryClient: QueryClient,
  args: {
    wallets?: Array<string | null | undefined>;
    tokens?: Array<string | null | undefined>;
  },
): void {
  for (const owner of uniq(args.wallets ?? [])) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.walletPortfolio.byOwner(owner),
    });
    void queryClient.invalidateQueries({
      queryKey: queryKeys.walletActivity.all(),
      predicate: (query) => query.queryKey[1] === owner,
    });
  }
  for (const token of uniq(args.tokens ?? [])) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.feeBalance.byToken(token),
    });
  }
}

/** On-chain token account changed (signing settings, ownership, etc.). */
export function invalidatePhygitalToken(
  queryClient: QueryClient,
  tokenAddress?: string | null,
): void {
  if (!tokenAddress) {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.phygitalToken.all(),
    });
    return;
  }
  void queryClient.invalidateQueries({
    queryKey: queryKeys.phygitalToken.all(),
    predicate: (query) => {
      const key = query.queryKey;
      if (key[1] === "address" && key[2] === tokenAddress) return true;
      return cachedTokenAddress(query.state.data) === tokenAddress;
    },
  });
}

/**
 * Apply a successful policy PUT into the shared cache.
 * Falls back to invalidate when nothing is cached yet.
 */
export function applyWalletPolicyPatch(
  queryClient: QueryClient,
  phygitalToken: string,
  patch: Partial<PolicySummary>,
): void {
  const key = queryKeys.walletPolicy.byToken(phygitalToken);
  const prev = queryClient.getQueryData<PolicySummary>(key);
  if (prev) {
    queryClient.setQueryData<PolicySummary>(key, { ...prev, ...patch });
    return;
  }
  void queryClient.invalidateQueries({ queryKey: key });
}

/** Invalidate DAS / portfolio caches when the active RPC preference changes. */
export function invalidateRpcDependentQueries(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.walletPortfolio.all(),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.dasCollectible.all(),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.mintedCollectibleView.all(),
  });
}
