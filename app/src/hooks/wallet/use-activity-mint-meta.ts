"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { queryKeys, queryOptions } from "@/lib/queries";
import { NATIVE_SOL_MINT } from "@/lib/tokens/payment-token";
import { dasGetAssetBatch } from "@/lib/solana/das-rpc";
import type { WalletActivityItem } from "@/lib/wallet/portfolio-types";

export type MintMeta = { symbol: string; name: string };

const SOL_META: MintMeta = { symbol: "SOL", name: "Solana" };

/**
 * Collect every unique mint referenced in activity items, then batch-resolve
 * symbol + name from DAS `getAssetBatch`. SOL is resolved locally.
 *
 * Results are cached with `stable` staleTime so we don't re-fetch the same
 * mints on every activity page.
 */
export function useActivityMintMeta(
  items: WalletActivityItem[],
): Record<string, MintMeta> {
  const unknownMints = useMemo(() => {
    const mints = new Set<string>();
    for (const item of items) {
      if (item.mint && item.mint !== NATIVE_SOL_MINT) mints.add(item.mint);
      for (const d of item.balanceDeltas ?? []) {
        if (d.mint !== NATIVE_SOL_MINT) mints.add(d.mint);
      }
    }
    return [...mints].sort();
  }, [items]);

  const batch = useQuery({
    queryKey: queryKeys.activityMintMeta.byMints(unknownMints),
    queryFn: async () => {
      if (unknownMints.length === 0) return {};
      const assets = await dasGetAssetBatch(unknownMints);
      const map: Record<string, MintMeta> = {};
      for (const asset of assets) {
        const id = asset.id?.trim();
        if (!id) continue;
        const tokenInfo = asset.token_info as
          | { symbol?: string }
          | undefined;
        const symbol =
          tokenInfo?.symbol?.trim() ||
          asset.content?.metadata?.symbol?.trim() ||
          id.slice(0, 4);
        const name =
          asset.content?.metadata?.name?.trim() || symbol;
        map[id] = { symbol, name };
      }
      return map;
    },
    enabled: unknownMints.length > 0,
    ...queryOptions.stable,
  });

  return useMemo(() => {
    const result: Record<string, MintMeta> = {
      [NATIVE_SOL_MINT]: SOL_META,
      SOL: SOL_META,
      ...(batch.data ?? {}),
    };
    return result;
  }, [batch.data]);
}
