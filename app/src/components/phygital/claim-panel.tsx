"use client";

import { useState } from "react";
import { CheckCircle2, Fingerprint, Nfc } from "lucide-react";
import type { TransferSession } from "phygital-token-sdk";

import {
  GateMessage,
  SuccessStatus,
  WalletBusyStatus,
} from "@/components/layout/gate-message";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import {
  useCaptureClaimTap,
  useFinishClaim,
} from "@/hooks/phygital/use-claim-phygital";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import {
  assertCaptureReady,
  assertClaimReady,
} from "@/lib/phygital/claim";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

type Stage = "ready" | "reading" | "confirm" | "confirming" | "added";

/**
 * Create or sign in to a passkey wallet, hold the accessory, then Face ID.
 * `fromVerifiedTap` is for NDEF URL landings that already proved the chip.
 */
export function ClaimPanel({
  token,
  unclaimed = false,
  fromVerifiedTap = false,
  onBack,
  onClaimed,
}: {
  token: PhygitalToken;
  unclaimed?: boolean;
  fromVerifiedTap?: boolean;
  onBack?: () => void;
  onClaimed?: () => void;
}) {
  const { isConnected, ready, connecting, signUp, signIn, session } =
    useSmartWallet();
  const capture = useCaptureClaimTap();
  const finish = useFinishClaim();

  const [stage, setStage] = useState<Stage>("ready");
  const [captured, setCaptured] = useState<{
    session: TransferSession;
    auth: Awaited<ReturnType<typeof capture.mutateAsync>>["auth"];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const holdTitle = fromVerifiedTap
    ? "Hold once more"
    : unclaimed
      ? "Add to Wallet"
      : "Move to a New Wallet";
  const holdBody = fromVerifiedTap
    ? "Hold this accessory to the back of your phone to add it."
    : "Hold your accessory to this phone, then confirm with Face ID.";
  const holdCta = fromVerifiedTap
    ? "Hold once more"
    : error
      ? "Try again"
      : "Hold to add";

  async function onCapture() {
    setError(null);
    try {
      assertCaptureReady(token);
    } catch (err) {
      setError(
        toUserErrorMessage(err, "Couldn’t add this accessory. Try again."),
      );
      return;
    }

    setStage("reading");
    try {
      const tap = await capture.mutateAsync({ token: token.address });
      setCaptured(tap);
      setStage("confirm");
    } catch (err) {
      setStage("ready");
      setError(
        toUserErrorMessage(
          err,
          "Couldn’t read the accessory. Turn on NFC and hold it to the back of your phone.",
        ),
      );
    }
  }

  async function onFinish() {
    if (!session || !captured) return;
    setError(null);

    try {
      assertClaimReady(token, session.vaultPda);
    } catch (err) {
      setError(
        toUserErrorMessage(err, "Couldn’t add this accessory. Try again."),
      );
      return;
    }

    setStage("confirming");
    try {
      await finish.mutateAsync({
        token,
        session: captured.session,
        auth: captured.auth,
        smartWallet: session,
      });
      setStage("added");
      window.setTimeout(() => onClaimed?.(), 1400);
    } catch (err) {
      setStage("confirm");
      setError(
        toUserErrorMessage(
          err,
          "That didn’t go through. Confirm with Face ID and try again.",
        ),
      );
    }
  }

  if (stage === "added") {
    return (
      <SuccessStatus
        icon={<CheckCircle2 className="size-6" />}
        title="Added"
        body="This accessory is in your wallet."
      />
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

  if (stage === "confirming") {
    return (
      <NfcHoldStatus
        title="Confirm with Face ID…"
        body="Approve the passkey prompt to continue."
        busy
      />
    );
  }

  if (!ready || connecting) {
    return <WalletBusyStatus connecting={connecting} />;
  }

  if (!isConnected) {
    return (
      <div className="flex flex-1 flex-col gap-5 py-2">
        {onBack ? <BackLink onClick={onBack} /> : null}
        <GateMessage
          icon={<Fingerprint className="size-5 text-muted-foreground" />}
          title="Create a passkey"
          body="This wallet will own this accessory. There is no recovery phrase. Network fees are covered."
          action={
            <div className="flex w-full max-w-64 flex-col gap-3">
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={signIn}
              >
                Sign in with passkey
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full"
                onClick={signUp}
              >
                Create a new wallet
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (stage === "confirm") {
    return (
      <div className="flex flex-1 flex-col gap-5 py-2">
        {onBack ? (
          <BackLink
            onClick={() => {
              setCaptured(null);
              setError(null);
              setStage("ready");
              onBack();
            }}
          />
        ) : null}
        <div className="space-y-1.5 text-center">
          <p className="text-base font-medium text-foreground">
            Confirm with Face ID
          </p>
          <p className="mx-auto max-w-72 text-sm text-muted-foreground">
            Approve with Face ID — network fees are covered.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {error ? (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={!session}
            onClick={() => void onFinish()}
          >
            {error ? "Try again" : "Confirm with Face ID"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {onBack ? <BackLink onClick={onBack} /> : null}
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title={holdTitle}
        body={holdBody}
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
              {holdCta}
            </Button>
          </div>
        }
      />
    </div>
  );
}
