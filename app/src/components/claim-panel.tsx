"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Nfc } from "lucide-react";

import { GateMessage, SuccessStatus } from "@/components/gate-message";
import { ExpiryCountdown } from "@/components/expiry-countdown";
import { InAppBrowserGate } from "@/components/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/use-is-in-app-browser";
import { createPendingClaim } from "@/lib/claim/pending-claim-client";
import {
  serializePendingClaimSession,
  type CreatePendingClaimResponse,
} from "../../shared/pending-claim-wire";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { assertCaptureReady, captureClaimTap } from "@/lib/payments/claim";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { toast } from "sonner";

type Stage = "ready" | "reading";

/**
 * Safari step 1: NFC tap only, then hand off to wallet finish (Privy connect).
 */
export function ClaimPanel({
  asset,
  unclaimed = false,
}: {
  asset: PhygitalAsset;
  unclaimed?: boolean;
}) {
  const router = useRouter();
  const inApp = useIsInAppBrowser();

  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<CreatePendingClaimResponse | null>(null);

  const title = unclaimed ? "Add to this phone" : "Move to this phone";

  async function onCapture() {
    setError(null);
    try {
      assertCaptureReady(asset);
    } catch (err) {
      setError(toUserErrorMessage(err, "Couldn’t add this NFC device. Try again."));
      return;
    }

    setStage("reading");
    try {
      const { session, auth } = await captureClaimTap({
        asset: asset.asset,
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

      setHandoff({
        token: pending.token,
        finishUrl: pending.finishUrl,
        expiresAtMs: pending.expiresAtMs,
      });
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

  function onContinue() {
    if (!handoff) return;
    router.push(`/device/finish?token=${encodeURIComponent(handoff.token)}`);
  }

  async function onCopyLink() {
    if (!handoff) return;
    try {
      await navigator.clipboard.writeText(handoff.finishUrl);
      toast.success("Finish link copied");
    } catch {
      toast.error("Couldn’t copy link");
    }
  }

  if (inApp) {
    return (
      <InAppBrowserGate body="Adding an NFC device needs Safari or Chrome." />
    );
  }

  if (handoff) {
    return (
      <div className="flex flex-1 flex-col gap-5 py-2">
        <SuccessStatus
          icon={<CheckCircle2 className="size-7" />}
          title="Device verified"
          body="Link your wallet to continue."
        />

        <ExpiryCountdown
          expiresAtMs={handoff.expiresAtMs}
          className="text-center text-xs text-muted-foreground"
        />

        <div className="flex flex-col gap-2.5">
          <Button type="button" size="lg" className="w-full" onClick={onContinue}>
            Continue
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => void onCopyLink()}
          >
            <Copy className="size-4" />
            Copy finish link
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Tap Continue, then choose your wallet in the connect screen.
        </p>
      </div>
    );
  }

  if (stage === "reading") {
    return (
      <NfcHoldStatus
        title="Hold your NFC device close"
        body="Keep it against the back until it reads."
        pulsing
      />
    );
  }

  return (
    <GateMessage
      icon={<Nfc className="size-5 text-muted-foreground" />}
      title={title}
      body="Hold your NFC device to verify, then finish in your wallet app."
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
            {error ? "Try again" : "Hold to add"}
          </Button>
        </div>
      }
    />
  );
}
