"use client";

import { Nfc } from "lucide-react";
import type { ReactNode } from "react";

import { GateMessage } from "@/components/layout/gate-message";
import { LoadingStatus } from "@/components/shared/loading-status";
import { usePhygitalTokenByAddress } from "@/hooks/token/use-phygital-token";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Load a token by PDA and render its home view (from collection binder). */
export function TokenByAddressHome({
  tokenAddress,
  renderHome,
}: {
  tokenAddress: string;
  renderHome: (args: { token: PhygitalToken }) => ReactNode;
}) {
  const tokenQuery = usePhygitalTokenByAddress(tokenAddress);

  if (tokenQuery.isLoading) {
    return <LoadingStatus label="Loading…" />;
  }

  if (tokenQuery.isError || !tokenQuery.data) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title="Couldn’t load item"
        body={toUserErrorMessage(
          tokenQuery.error,
          "This item may no longer exist on chain.",
        )}
      />
    );
  }

  return renderHome({ token: tokenQuery.data });
}
