"use client";

import { AccessoryIdentity } from "@/components/shared/accessory-identity";
import { BackToDashboard } from "@/components/shared/back-to-dashboard";
import { AuthenticityBadge } from "@/components/card/authenticity-badge";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";
import { shortAddress } from "@/lib/utils";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Collection browse detail for an owned accessory.
 * Authenticity only — Lock / Remove live on the `/` hub ⋮ menus.
 */
export function AccessoryBrowsePanel({
  token,
  liveConfirmed = false,
}: {
  token: PhygitalToken;
  liveConfirmed?: boolean;
}) {
  const owner = String(token.currentOwner);

  return (
    <div className={cn("flex flex-1 flex-col gap-6 py-2", galleryAnimate.fade)}>
      <BackToDashboard />
      <div className="flex flex-col items-center gap-4 text-center">
        <AccessoryIdentity token={token} className="w-full max-w-xs" />
        <AuthenticityBadge confirmed={liveConfirmed} />
        <p className="text-xs text-muted-foreground">
          {liveConfirmed ? copy.confirmedJustNow : copy.registeredOnChain}
        </p>
        <p className="text-xs text-muted-foreground">
          Linked to {shortAddress(owner)}.
        </p>
      </div>
    </div>
  );
}
