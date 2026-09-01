"use client";

import { Nfc } from "lucide-react";
import type { ReactNode } from "react";

import { GateMessage } from "@/components/layout/gate-message";
import { CollectionVerifiedSeed } from "@/components/token/collection-verified-seed";
import { TokenRouteShell } from "@/components/token/token-route-shell";
import { LoadingStatus } from "@/components/shared/loading-status";
import { usePhygitalTokenByAddress } from "@/hooks/token/use-phygital-token";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import type { ShellLayout } from "@/lib/layout";
import { toUserErrorMessage } from "@/lib/user-errors";

function layoutForToken(token: PhygitalToken): ShellLayout {
  return tokenHasLinkedMint(token) ? "gallery" : "compact";
}

/** Collection deep link — shell width follows minted vs accessory. */
export function TokenAddressRoute({
  tokenAddress,
  fromCollection,
  renderHome,
}: {
  tokenAddress: string;
  fromCollection: boolean;
  renderHome: (args: {
    token: PhygitalToken;
    fromCollection: boolean;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const tokenQuery = usePhygitalTokenByAddress(tokenAddress);
  const layout: ShellLayout =
    tokenQuery.data != null ? layoutForToken(tokenQuery.data) : "compact";

  return (
    <TokenRouteShell layout={layout}>
      {tokenQuery.isLoading ? (
        <LoadingStatus label="Loading…" />
      ) : tokenQuery.isError || !tokenQuery.data ? (
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title="Couldn’t load item"
          body={toUserErrorMessage(
            tokenQuery.error,
            "This item may no longer exist on chain.",
          )}
        />
      ) : (
        <CollectionVerifiedSeed
          owner={String(tokenQuery.data.currentOwner)}
          fromCollection={fromCollection}
        >
          {({ fromCollection: fromHub, collectionVerified }) =>
            renderHome({
              token: tokenQuery.data,
              fromCollection: fromHub,
              liveConfirmed: collectionVerified,
            })
          }
        </CollectionVerifiedSeed>
      )}
    </TokenRouteShell>
  );
}
