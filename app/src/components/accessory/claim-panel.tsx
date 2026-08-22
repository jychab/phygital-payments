"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Fingerprint, Nfc } from "lucide-react";
import type { TransferSession } from "phygital-token-sdk";

import { GateMessage, WalletBusyStatus } from "@/components/layout/gate-message";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import {
  assertCaptureReady,
  assertClaimReady,
  captureClaimTap,
  finishClaim,
} from "@/lib/accessory/claim";
import { invalidatePhygitalTokenQueries, setPhygitalTokenOwner } from "@/lib/queries";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

type Stage = "ready" | "reading" | "confirm" | "confirming";

type CapturedTap = {
  session: TransferSession;
  auth: Awaited<ReturnType<typeof captureClaimTap>>["auth"];
};

/**
 * NFC tap, then create a passkey and confirm with Face ID in the same tab.
 */
export function ClaimPanel({
  token,
  unclaimed = false,
  onBack,
  onClaimed,
}: {
  token: PhygitalToken;
  unclaimed?: boolean;
  onBack?: () => void;
  onClaimed?: () => void;
}) {
  const queryClient = useQueryClient();
  const { isConnected, ready, connecting, connect, session } =
    useSmartWallet();

  const [stage, setStage] = useState<Stage>("ready");
  const [captured, setCaptured] = useState<CapturedTap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const title = unclaimed ? "Add to Wallet" : "Move to a New Wallet";

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
      const tap = await captureClaimTap({
        token: token.address,
      });
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
      await finishClaim({
        session: captured.session,
        auth: captured.auth,
        smartWallet: session,
      });
      setPhygitalTokenOwner(queryClient, token, session.vaultPda);
      await invalidatePhygitalTokenQueries(queryClient, {
        identifier: token.identifier,
        secp256r1PublicKey: token.secp256r1PublicKey,
      });
      onClaimed?.();
    } catch (err) {
      setStage("confirm");
      setError(
        toUserErrorMessage(
          err,
          "That didn't go through. Confirm with Face ID and try again.",
        ),
      );
    }
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

  if (stage === "confirm") {
    const needsPasskey = !isConnected;
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
            {needsPasskey ? "Create a passkey" : "Confirm with Face ID"}
          </p>
          <p className="mx-auto max-w-72 text-sm text-muted-foreground">
            {needsPasskey
              ? "This passkey will own the accessory. Confirm with Face ID — network fees are covered."
              : "Approve with Face ID — network fees are covered."}
          </p>
        </div>

        {!ready || connecting ? (
          <WalletBusyStatus connecting={connecting} />
        ) : needsPasskey ? (
          <GateMessage
            icon={<Fingerprint className="size-5 text-muted-foreground" />}
            title="Create a passkey"
            body="This passkey will own the accessory."
            action={
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={connect}
              >
                Create a passkey
              </Button>
            }
          />
        ) : (
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
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      {onBack ? <BackLink onClick={onBack} /> : null}
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title={title}
        body="Hold your accessory to this phone, then connect the wallet that should own it."
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
