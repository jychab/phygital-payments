"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOwnerQueryRefresh } from "@/hooks/use-owner-query-refresh";
import { cn } from "@/lib/utils";

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
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      className={cn("text-muted-foreground", className)}
      onClick={refresh}
      disabled={isFetching}
      aria-label="Refresh"
    >
      <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
    </Button>
  );
}
