"use client";

import { Nfc } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { LoadingStatus } from "@/components/shared/loading-status";
import { usePhygitalTokenByAddress } from "@/hooks/accessory/use-phygital-token";
import { useEnsurePhygitalSurface } from "@/hooks/phygital/use-ensure-phygital-surface";
import type { PhygitalSurface } from "@/lib/phygital/surface";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";
import type { ReactNode } from "react";

/** Load a token by PDA and render the surface home view (from collection binder). */
export function PhygitalByAddressHome({
  tokenAddress,
  surface,
  renderHome,
}: {
  tokenAddress: string;
  surface: PhygitalSurface;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const tokenQuery = usePhygitalTokenByAddress(tokenAddress);
  const mismatch = useEnsurePhygitalSurface(tokenQuery.data, surface);

  if (tokenQuery.isLoading || mismatch) {
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
