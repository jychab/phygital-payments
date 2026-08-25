"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nfc } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { InlineError } from "@/components/shared/inline-error";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { BackLink } from "@/components/shared/back-link";
import { StepProgress } from "@/components/shared/step-progress";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { createPendingClaim } from "@/lib/accessory/pending-claim-client";
import {
  assertCaptureReady,
  captureClaimTap,
} from "@/lib/accessory/claim";
import { serializePendingClaimSession } from "../../../shared/pending-claim-wire";
import { claimHref, surfaceForToken } from "@/lib/phygital/surface";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

type Stage = "ready" | "reading";

/**
 * Safari NFC tap, then replace to `/card?token=` or `/accessory?token=`
 * for wallet connect.
 */
export function ClaimPanel({
  token,
  unclaimed = false,
  onBack,
}: {
  token: PhygitalToken;
  unclaimed?: boolean;
  onBack?: () => void;
}) {
  const router = useRouter();
  const inApp = useIsInAppBrowser();

  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState<string | null>(null);

  const noun = surfaceForToken(token);
  const title = unclaimed ? copy.addToWallet : "Move to a New Wallet";

  async function onCapture() {
    setError(null);
    try {
      assertCaptureReady(token);
    } catch (err) {
      setError(
        toUserErrorMessage(err, `Couldn’t add this ${noun}. Try again.`),
      );
      return;
    }

    setStage("reading");
    try {
      const { session, auth } = await captureClaimTap({
        token: token.address,
        onPasskeyComplete: () => {
          try {
            navigator.vibrate?.(30);
          } catch {
            /* ignore */
          }
        },
      });

      const pending = await createPendingClaim({
        session: serializePendingClaimSession(session),
        auth,
      });

      router.replace(claimHref(pending.token, token));
    } catch (err) {
      setStage("ready");
      setError(
        toUserErrorMessage(
          err,
          `Couldn’t read the ${noun}. Turn on NFC and hold it to the back of your phone.`,
        ),
      );
    }
  }

  if (inApp) {
    return (
      <InAppBrowserGate
        body={`To add a${noun === "accessory" ? "n accessory" : " card"}, open this page in Safari or Chrome.`}
      />
    );
  }

  if (stage === "reading") {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <StepProgress
          step={1}
          total={2}
          labels={[copy.claimStepHold, copy.claimStepConfirm]}
        />
        <NfcHoldStatus
          title={copy.holdStill}
          body={copy.holdStillBody}
          pulsing
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      {onBack ? <BackLink onClick={onBack} /> : null}
      <StepProgress
        step={1}
        total={2}
        labels={[copy.claimStepHold, copy.claimStepConfirm]}
      />
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title={title}
        body={`Hold your ${noun} to this phone, then connect the wallet that should own it. ${copy.claimNetworkFee}`}
        action={
          <div className="flex w-full max-w-64 flex-col gap-3">
            {error ? <InlineError>{error}</InlineError> : null}
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => void onCapture()}
            >
              <Nfc className="size-4" />
              {error ? "Try again" : copy.holdToAdd}
            </Button>
          </div>
        }
      />
    </div>
  );
}
