"use client";

import { NavBar, NavBarBack } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import {
  redirectToLimitsSetup,
  type PolicySetupScreen,
} from "@/lib/wallet/limits-setup-href";
import type { LinkStatus } from "@/lib/wallet/device-auth-client";

/** Calm sheet when Limits need Home passkey + link. */
export function LimitsSetupSheet({
  phygitalTokenPda,
  linkStatus,
  screen,
  onBack,
}: {
  phygitalTokenPda: string;
  linkStatus?: LinkStatus;
  screen: PolicySetupScreen;
  onBack: () => void;
}) {
  const linkedElsewhere = linkStatus === "linked_elsewhere";

  return (
    <div className="flex flex-1 flex-col gap-4">
      <NavBar
        leading={<NavBarBack onClick={onBack} />}
        title={
          linkedElsewhere
            ? copy.wallet.limitsLinkedElsewhereTitle
            : copy.wallet.limitsSetupTitle
        }
      />
      <p className="text-sm text-muted-foreground">
        {linkedElsewhere
          ? copy.wallet.limitsLinkedElsewhereBody
          : copy.wallet.limitsSetupBody}
      </p>
      {!linkedElsewhere ? (
        <Button
          type="button"
          size="lg"
          className="mt-auto"
          onClick={() => redirectToLimitsSetup(phygitalTokenPda, screen)}
        >
          {copy.wallet.limitsSetupCta}
        </Button>
      ) : (
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="mt-auto"
          onClick={onBack}
        >
          {copy.common.done}
        </Button>
      )}
    </div>
  );
}
