"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { address, type Address } from "@solana/kit";

import { queryKeys, queryOptions } from "@/lib/queries";
import {
  fetchRecipientAtaStatus,
  type RecipientAtaStatus,
} from "@/lib/tokens/ata";
import type { TokenProgram } from "@/lib/tokens/mint-delegate";

/**
 * Whether a recipient already has a token account for `mint`. Pass the
 * resolved `program` (from useMintProgram) to avoid re-resolving it here.
 * `keepPreviousData` keeps the last result visible while the recipient changes,
 * so the panel doesn't flash back to empty.
 */
export function useRecipientAtaStatus(
  owner: string | null,
  mint: Address,
  program?: TokenProgram,
) {
  return useQuery<RecipientAtaStatus>({
    queryKey: queryKeys.ataStatus.byOwnerMint(owner, mint),
    queryFn: () =>
      fetchRecipientAtaStatus({ owner: address(owner!), mint, program }),
    enabled: Boolean(owner),
    placeholderData: keepPreviousData,
    ...queryOptions.default,
  });
}
