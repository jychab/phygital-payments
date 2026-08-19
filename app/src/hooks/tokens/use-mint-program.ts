"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import {
  fetchMintProgram,
  queryKeys,
  queryOptions,
  type MintProgramInfo,
} from "@/lib/queries";

/** A mint's token program + decimals. Immutable on-chain, so never refetched. */
export function useMintProgram(mint: Address) {
  return useQuery<MintProgramInfo>({
    queryKey: queryKeys.mintProgram.byMint(mint),
    queryFn: () => fetchMintProgram(mint),
    ...queryOptions.immutable,
  });
}
