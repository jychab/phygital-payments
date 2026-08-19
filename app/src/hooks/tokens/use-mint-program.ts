"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import {
  fetchMintProgram,
  queryKeys,
  queryOptions,
  type MintProgramInfo,
} from "@/lib/queries";

/** A mint's token program + decimals. Effectively immutable, so cached long. */
export function useMintProgram(mint: Address) {
  return useQuery<MintProgramInfo>({
    queryKey: queryKeys.mintProgram.byMint(mint),
    queryFn: () => fetchMintProgram(mint),
    ...queryOptions.stable,
  });
}
