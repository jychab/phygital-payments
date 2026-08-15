"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Nfc } from "lucide-react";

import { CenteredStatus } from "@/components/enable/gate-message";
import { InAppBrowserGate } from "@/components/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { SolanaAddressField } from "@/components/solana-address-field";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/use-is-in-app-browser";
import { usePrefillAddress } from "@/hooks/use-prefill-address";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { claimSponsoredOwnership, assertClaimReady } from "@/lib/payments/claim";
import { tryParseAddress } from "@/lib/payments/payment-request";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { queryKeys } from "@/lib/queries";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

type Stage = "ready" | "reading" | "confirming" | "done";

/**
 * Paste spending wallet, then NFC + sponsored claim (no wallet signature).
 */
export function ClaimPanel({
  asset,
  unclaimed = false,
  onClaimed,
}: {
  asset: PhygitalAsset;
  unclaimed?: boolean;
  onClaimed?: (recipient: string) => void;
}) {
  const { address: connectedAddress } = useSolanaAddress();
  const inApp = useIsInAppBrowser();
  const queryClient = useQueryClient();
  const assetKey = queryKeys.asset.byPk(asset.secp256r1PublicKey);

  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState<string | null>(null);
  const [recipientInput, setRecipientInput] = useState(connectedAddress ?? "");
  usePrefillAddress(connectedAddress, recipientInput, setRecipientInput);

  const recipient = tryParseAddress(recipientInput);
  const busy = stage === "reading" || stage === "confirming";

  async function onClaim() {
    if (!recipient) {
      setError("Enter a valid wallet address.");
      return;
    }
    setError(null);
    try {
      await assertClaimReady({ asset: asset.asset, recipient });
    } catch (err) {
      setError(toUserErrorMessage(err, "Couldn’t add this NFC device. Try again."));
      return;
    }

    const progress = { confirming: false };
    setStage("reading");
    try {
      await queryClient.cancelQueries({ queryKey: assetKey });
      await claimSponsoredOwnership({
        asset: asset.asset,
        recipient,
        skipReadyCheck: true,
        onPasskeyComplete: () => {
          progress.confirming = true;
          setStage("confirming");
          try {
            navigator.vibrate?.(30);
          } catch {
            /* ignore */
          }
        },
      });
      setStage("done");
      window.setTimeout(() => onClaimed?.(recipient), 1200);
    } catch (err) {
      setStage("ready");
      setError(
        toUserErrorMessage(
          err,
          progress.confirming
            ? "That didn’t go through. Check the address and try again."
            : "Couldn’t read the NFC device. Turn on NFC and hold it near the back of your phone.",
        ),
      );
    } finally {
      void queryClient.invalidateQueries({ queryKey: assetKey });
    }
  }

  if (inApp) {
    return (
      <InAppBrowserGate body="Adding an NFC device needs Safari or Chrome." />
    );
  }

  if (stage === "done" && recipient) {
    return (
      <CenteredStatus>
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <p className="text-base font-medium text-foreground">Added</p>
        <p className="max-w-56 text-sm text-muted-foreground">
          Next, choose how much this device can spend.
        </p>
      </CenteredStatus>
    );
  }

  if (busy) {
    return (
      <NfcHoldStatus
        title={stage === "confirming" ? "Adding…" : "Hold your NFC device close"}
        body={
          stage === "confirming"
            ? "Almost done…"
            : "Keep it against the back until it reads."
        }
        pulsing={stage === "reading"}
        busy={stage === "confirming"}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <div className="space-y-1.5 text-center">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
          <Nfc className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {unclaimed ? "Add to this phone" : "Move to this phone"}
        </p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Choose the wallet that holds your USDC, then hold your NFC device.
        </p>
      </div>

      <SolanaAddressField
        value={recipientInput}
        onChange={setRecipientInput}
        connectedAddress={connectedAddress}
        onUseConnected={() => {
          if (connectedAddress) setRecipientInput(connectedAddress);
        }}
        disabled={busy}
        label="Paying from"
        hint="This is the balance your NFC device will use."
      />

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full"
        disabled={!recipient || busy}
        onClick={() => void onClaim()}
      >
        <Nfc className="size-4" />
        {error ? "Try again" : "Hold to add"}
      </Button>
    </div>
  );
}
