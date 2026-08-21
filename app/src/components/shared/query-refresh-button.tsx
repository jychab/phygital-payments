"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOwnerQueryRefresh } from "@/hooks/wallet/use-owner-query-refresh";
import {
  invalidatePhygitalTokenQueries,
  queryKeys,
} from "@/lib/queries";
import type { PhygitalToken } from "@/lib/phygital/token";
import { cn } from "@/lib/utils";

function RefreshIconButton({
  isFetching,
  onRefresh,
  className,
}: {
  isFetching: boolean;
  onRefresh: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className={cn("text-muted-foreground", className)}
      onClick={onRefresh}
      disabled={isFetching}
      aria-label="Refresh"
    >
      <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
    </Button>
  );
}

/** Icon control to refetch owner-scoped queries while they are still stale. */
export function QueryRefreshButton({
  owner,
  className,
}: {
  owner: string;
  className?: string;
}) {
  const { isFetching, refresh } = useOwnerQueryRefresh(owner);

  return (
    <RefreshIconButton
      isFetching={isFetching}
      onRefresh={refresh}
      className={className}
    />
  );
}

/** Refetch this accessory's on-chain token (ownership can change off-tab). */
export function PhygitalTokenRefreshButton({
  token,
  className,
}: {
  token: PhygitalToken;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const address = String(token.address);
  const owner = String(token.currentOwner);
  const isFetching =
    useIsFetching({ queryKey: queryKeys.phygitalToken.all() }) > 0;

  return (
    <RefreshIconButton
      isFetching={isFetching}
      onRefresh={() =>
        invalidatePhygitalTokenQueries(queryClient, {
          address,
          identifier: token.identifier,
          secp256r1PublicKey: token.secp256r1PublicKey,
          currentOwner: owner,
        })
      }
      className={className}
    />
  );
}
