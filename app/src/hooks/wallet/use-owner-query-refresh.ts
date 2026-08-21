"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";

import { invalidateOwnerQueries, isOwnerDataQuery } from "@/lib/queries";

/** Force-refetch holdings, limits, history, and accessories for `owner`. */
export function useOwnerQueryRefresh(owner: string | null) {
  const queryClient = useQueryClient();
  const isFetching =
    useIsFetching({
      predicate: (query) =>
        owner != null && isOwnerDataQuery(query.queryKey, owner),
    }) > 0;

  return {
    isFetching,
    refresh: () => {
      if (!owner) return;
      invalidateOwnerQueries(queryClient, owner);
    },
  };
}
