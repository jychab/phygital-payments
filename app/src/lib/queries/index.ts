/**
 * Centralized React Query keys, fetchers, and option presets — the single
 * source of truth for the payment app's server state.
 */

import type { Address } from "@solana/kit";

import {
  fetchMintDelegateStatus,
  resolveMintProgram,
  type TokenProgram,
  type UsdcDelegateStatus,
} from "@/lib/payments/usdc-allowance";
import {
  fetchRecipientAtaStatus,
  type RecipientAtaStatus,
} from "@/lib/payments/receive";
import {
  fetchPaymentHistory,
  type PaymentRecord,
} from "@/lib/payments/history-client";

// ============================================================================
// Query keys
// ============================================================================

export const queryKeys = {
  delegateStatus: {
    all: () => ["delegateStatus"] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.delegateStatus.all(), owner] as const,
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

  asset: {
    all: () => ["assets"] as const,
    byPk: (pk: string | null) =>
      [...queryKeys.asset.all(), "pk", pk] as const,
    byOwner: (owner: string | null) =>
      [...queryKeys.asset.all(), "owner", owner] as const,
  },
};

// ============================================================================
// Option presets (staleTime tuned per data volatility)
// ============================================================================

export const queryOptions = {
  /** General reads — spending limit, balances. */
  default: { refetchOnWindowFocus: false, staleTime: 1000 * 60 },
  /** Updates as payments confirm on-chain. */
  frequent: { refetchOnWindowFocus: false, staleTime: 1000 * 30 },
  /** Effectively immutable — a mint's program + decimals. */
  stable: { refetchOnWindowFocus: false, staleTime: 1000 * 60 * 5 },
} as const;

// ============================================================================
// Fetchers (reuse the existing domain functions)
// ============================================================================

export type MintProgramInfo = { program: TokenProgram; decimals: number };

export function fetchMintProgram(mint: Address): Promise<MintProgramInfo> {
  return resolveMintProgram(mint);
}

export function fetchDelegateStatus(
  owner: Address,
): Promise<UsdcDelegateStatus> {
  return fetchMintDelegateStatus(owner);
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

export type {
  UsdcDelegateStatus,
  RecipientAtaStatus,
  TokenProgram,
  PaymentRecord,
};
