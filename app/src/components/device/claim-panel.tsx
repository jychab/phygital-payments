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
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/user-errors";

type Stage = "ready" | "reading";

/**
 * Safari NFC tap, then replace to `/device?token=` for wallet connect.
 */
export function ClaimPanel({
  asset,
  unclaimed = false,
  onBack,
}: {
  asset: PhygitalAsset;
  unclaimed?: boolean;
  onBack?: () => void;
}) {
  const router = useRouter();
  const inApp = useIsInAppBrowser();

  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState<string | null>(null);

  const title = unclaimed ? "Claim to wallet" : "Claim to a new wallet";

  async function onCapture() {
    setError(null);
    try {
      assertCaptureReady(asset);
    } catch (err) {
      setError(
        toUserErrorMessage(err, "Couldn’t claim this NFC device. Try again."),
      );
      return;
    }

    setStage("reading");
    try {
      const { session, auth } = await captureClaimTap({
        asset: asset.address,
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
          "Couldn’t read the NFC device. Turn on NFC and hold it near the back of your phone.",
        ),
      );
    }
  }

  if (inApp) {
    return (
      <InAppBrowserGate body="Claiming an NFC device needs Safari or Chrome." />
    );
  }

  if (stage === "reading") {
    return (
      <NfcHoldStatus
        title="Hold Still…"
        body="Keep it against the back until it reads."
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
        body="Hold your NFC device to prove possession, then connect the wallet that should own it."
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
              {error ? "Try again" : "Hold to claim"}
            </Button>
          </div>
        }
      />
    </div>
  );
}
