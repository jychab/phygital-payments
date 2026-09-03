"use client";

import { Nfc } from "lucide-react";
import type { ReactNode } from "react";

import { GateMessage } from "@/components/layout/gate-message";
import { TokenRouteShell } from "@/components/token/token-route-shell";
import { LoadingStatus } from "@/components/shared/loading-status";
import { usePhygitalTokenByAddress } from "@/hooks/token/use-phygital-token";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import type { ShellLayout } from "@/lib/layout";
import { copy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";

function layoutForToken(token: PhygitalToken): ShellLayout {
  return tokenHasLinkedMint(token) ? "gallery" : "compact";
}

/** Collection deep link — shell width follows minted vs accessory. */
export function TokenAddressRoute({
  tokenAddress,
  renderHome,
}: {
  tokenAddress: string;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const tokenQuery = usePhygitalTokenByAddress(tokenAddress);
  const layout: ShellLayout =
    tokenQuery.data != null ? layoutForToken(tokenQuery.data) : "compact";

  return (
    <TokenRouteShell layout={layout}>
      {tokenQuery.isLoading ? (
        <LoadingStatus label={copy.common.loading} />
      ) : tokenQuery.isError || !tokenQuery.data ? (
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title={copy.token.itemLoadFailed}
          body={toUserErrorMessage(
            tokenQuery.error,
            copy.token.itemNotOnChain,
          )}
        />
      ) : (
        renderHome({ token: tokenQuery.data })
      )}
    </TokenRouteShell>
  );
}
