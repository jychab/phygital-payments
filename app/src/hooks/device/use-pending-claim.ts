"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchPendingClaim } from "@/lib/device/pending-claim-client";
import { queryKeys, queryOptions } from "@/lib/queries";

/** Load a Safari tap proof for wallet-browser finish. */
export function usePendingClaim(token: string | null) {
  return useQuery({
    queryKey: queryKeys.pendingClaim.byToken(token),
    queryFn: () => {
      if (!token) throw new Error("Missing token");
      return fetchPendingClaim(token);
    },
    enabled: Boolean(token),
    retry: false,
    ...queryOptions.frequent,
  });
}
