/**
 * Centralized React Query keys, fetchers, and option presets — the single
 * source of truth for the payment app's server state. Mirrors the vault app's
 * conventions (object-of-objects keys with `all()` + `by*()`, shared option
 * presets) so the two apps stay idiomatically consistent.
 */

import type { Address } from "@solana/kit";

import {
  fetchUsdcDelegateStatus,
  resolveMintProgram,
  type TokenProgram,
  type UsdcDelegateStatus,
} from "@/lib/payments/fund";
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
  all: () => ["query"] as const,

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
};

// ============================================================================
// Option presets (staleTime tuned per data volatility)
// ============================================================================

export const queryOptions = {
  /** General reads — allowance, balances. */
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
  return fetchUsdcDelegateStatus(owner);
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
