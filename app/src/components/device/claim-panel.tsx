"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nfc } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { createPendingClaim } from "@/lib/device/pending-claim-client";
import {
  assertCaptureReady,
  captureClaimTap,
  deviceClaimHref,
} from "@/lib/device/claim";
import { serializePendingClaimSession } from "../../../shared/pending-claim-wire";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

type Stage = "ready" | "reading";

/**
 * Safari NFC tap, then replace to `/device?token=` for wallet connect.
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

  const title = unclaimed ? "Add to Wallet" : "Move to a New Wallet";

  async function onCapture() {
    setError(null);
    try {
      assertCaptureReady(token);
    } catch (err) {
      setError(
        toUserErrorMessage(err, "Couldn’t add this device. Try again."),
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

      router.replace(deviceClaimHref(pending.token));
    } catch (err) {
      setStage("ready");
      setError(
        toUserErrorMessage(
          err,
          "Couldn’t read the device. Turn on NFC and hold it to the back of your phone.",
        ),
      );
    }
  }

  if (inApp) {
    return (
      <InAppBrowserGate body="To add a device, open this page in Safari or Chrome." />
    );
  }

  if (stage === "reading") {
    return (
      <NfcHoldStatus
        title="Hold Still…"
        body="Keep holding until it reads."
        pulsing
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {onBack ? <BackLink onClick={onBack} /> : null}
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title={title}
        body="Hold your device to this phone, then connect the wallet that should own it."
        action={
          <div className="flex w-full max-w-64 flex-col gap-3">
            {error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => void onCapture()}
            >
              <Nfc className="size-4" />
              {error ? "Try again" : "Hold to Add"}
            </Button>
          </div>
        }
      />
    </div>
  );
}
