"use client";

import { useCallback, useState } from "react";
import { useFiatOnramp } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { invalidateOwnerQueries } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  isOnrampUserExit,
  ONRAMP_DEFAULT_AMOUNT,
  onrampEnvironment,
  SOLANA_ONRAMP_CHAIN,
  SOLANA_ONRAMP_USDC,
} from "@/lib/wallet/fiat-onramp";

/**
 * Open Privy's fiat onramp for Solana USDC, then refresh owner balances.
 */
export function useBuyUsdc(address: string | null) {
  const { fund } = useFiatOnramp();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const buyUsdc = useCallback(
    async (defaultAmount = ONRAMP_DEFAULT_AMOUNT) => {
      if (!address || pending) return;
      setPending(true);
      try {
        const result = await fund({
          source: { assets: ["usd"], defaultAsset: "usd" },
          destination: {
            asset: SOLANA_ONRAMP_USDC,
            chain: SOLANA_ONRAMP_CHAIN,
            address,
          },
          environment: onrampEnvironment(),
          defaultAmount,
        });
        invalidateOwnerQueries(queryClient, address);
        toast.success(
          result.status === "confirmed"
            ? "USDC is on the way"
            : "Purchase submitted",
        );
      } catch (error) {
        if (isOnrampUserExit(error)) return;
        toast.error(toUserErrorMessage(error, "Couldn’t buy USDC"));
      } finally {
        setPending(false);
      }
    },
    [address, fund, pending, queryClient],
  );

  return { buyUsdc, pending };
}
