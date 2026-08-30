"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ConnectGate } from "@/components/shared/connect-gate";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { InlineError } from "@/components/shared/inline-error";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { BackLink } from "@/components/shared/back-link";
import { StageTransition } from "@/components/shared/stage-transition";
import { StepProgress } from "@/components/shared/step-progress";
import { CollectibleOrb } from "@/components/token/collectible-orb";
import { TokenStickyActions } from "@/components/token/token-sticky-actions";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";
import {
  assertCaptureReady,
  assertClaimReady,
  captureClaimTap,
  finishClaim,
} from "@/lib/token/claim";
import { copy } from "@/lib/copy/phygital";
import {
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";
import {
  invalidateOwnerQueries,
  invalidatePhygitalTokenQueries,
} from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";

type Stage = "ready" | "reading" | "confirm" | "confirming";

type CapturedTap = Awaited<ReturnType<typeof captureClaimTap>>;

/**
 * In-place claim: NFC tap → connect wallet → confirm.
 * On success, calls `onClaimed` so the parent home can update owner and exit claim UI.
 */
export function ClaimPanel({
  token,
  noun,
  unclaimed = false,
  onBack,
  onClaimed,
}: {
  token: PhygitalToken;
  /** User-facing word from mint (`card`) or no-mint (`accessory`). */
  noun: "card" | "accessory";
  unclaimed?: boolean;
  onBack?: () => void;
  onClaimed: (owner: string) => void;
}) {
  const queryClient = useQueryClient();
  const inApp = useIsInAppBrowser();
  const { address, connect } = useSolanaAddress();
  const signer = useWalletKitSigner();

  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState<string | null>(null);
  const [tap, setTap] = useState<CapturedTap | null>(null);

  const title = unclaimed ? copy.addToWallet : "Move to a New Wallet";
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);
  const orbSrc = collectible?.image ?? null;
  const orbAlt = collectible?.name ?? "";

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
      const captured = await captureClaimTap({
        token: token.address,
        onPasskeyComplete: () => {
          try {
            navigator.vibrate?.(30);
          } catch {
            /* ignore */
          }
        },
      });
      setTap(captured);
      setStage("confirm");
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

  async function onFinish() {
    if (!signer || !address || !tap) return;
    setError(null);

    try {
      assertClaimReady(token, signer.address);
    } catch (err) {
      setError(
        toUserErrorMessage(err, `Couldn’t add this ${noun}. Try again.`),
      );
      return;
    }

    setStage("confirming");
    try {
      await finishClaim({
        session: tap.session,
        auth: tap.auth,
        recipient: signer,
      });

      invalidateOwnerQueries(queryClient, address);
      await invalidatePhygitalTokenQueries(queryClient, {
        address: String(token.address),
        identifier: token.identifier,
        secp256r1PublicKey: token.secp256r1PublicKey,
        currentOwner: address,
      });

      onClaimed(address);
    } catch (err) {
      setStage("confirm");
      setError(
        toUserErrorMessage(
          err,
          "That didn't go through. Approve in your wallet and try again.",
        ),
      );
    }
  }

  if (inApp) {
    return <InAppBrowserGate body={copy.openInBrowser} />;
  }

  const chrome = (
    <>
      {onBack && stage !== "confirming" ? (
        <BackLink onClick={onBack} />
      ) : null}
      <StepProgress
        step={stage === "confirm" || stage === "confirming" ? 2 : 1}
        total={2}
        labels={[copy.claimStepHold, copy.claimStepConfirm]}
      />
    </>
  );

  return (
    <div className="flex flex-1 flex-col gap-4">
      {chrome}
      <StageTransition
        stageKey={stage}
        className="flex flex-1 flex-col gap-4"
      >
        {stage === "reading" ? (
          <NfcHoldStatus
            title={copy.holdStill}
            body={copy.holdStillBody}
            pulsing
            imageSrc={orbSrc}
            imageAlt={orbAlt}
          />
        ) : null}

        {stage === "confirming" ? (
          <NfcHoldStatus
            title="Confirm in wallet…"
            body="Approve in your wallet to continue."
            busy
            imageSrc={orbSrc}
            imageAlt={orbAlt}
          />
        ) : null}

        {stage === "confirm" ? (
          <>
            <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-5 py-6">
              <CollectibleOrb
                src={orbSrc}
                alt={orbAlt}
                size="lg"
                pulsing={false}
              />
              <div className="w-full max-w-72 space-y-1.5 text-center">
                <p className="text-base font-medium text-foreground">
                  {copy.claimConfirmTitle}
                </p>
                <p className="text-sm text-muted-foreground">
                  {copy.claimConfirmBody(noun)}
                </p>
              </div>
            </div>
            <TokenStickyActions>
              {!address ? (
                <ConnectGate
                  title="Connect your wallet"
                  body={`This wallet will own the ${noun}.`}
                  onConnect={connect}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {error ? <InlineError>{error}</InlineError> : null}
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    disabled={!signer}
                    onClick={() => void onFinish()}
                  >
                    {error ? "Try again" : "Confirm in wallet"}
                  </Button>
                </div>
              )}
            </TokenStickyActions>
          </>
        ) : null}

        {stage === "ready" ? (
          <>
            <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-5 py-6">
              <CollectibleOrb
                src={orbSrc}
                alt={orbAlt}
                size="lg"
                pulsing
                onClick={() => void onCapture()}
                ariaLabel={copy.holdToAdd}
              />
              <div className="w-full max-w-72 space-y-1.5 text-center">
                <p className="text-base font-medium text-foreground">
                  {title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {copy.claimReadyBody(noun)}
                </p>
                {error ? <InlineError>{error}</InlineError> : null}
              </div>
            </div>
            <TokenStickyActions>
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => void onCapture()}
              >
                {error ? "Try again" : copy.holdToAdd}
              </Button>
            </TokenStickyActions>
          </>
        ) : null}
      </StageTransition>
    </div>
  );
}
