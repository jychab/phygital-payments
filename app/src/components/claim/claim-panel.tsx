"use client";

import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ConnectGate } from "@/components/shared/connect-gate";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { InlineError } from "@/components/shared/inline-error";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { BackLink } from "@/components/shared/back-link";
import { StageTransition } from "@/components/shared/stage-transition";
import { StickyActions } from "@/components/shared/sticky-actions";
import { StepProgress } from "@/components/shared/step-progress";
import { MotionSection } from "@/components/shared/motion-section";
import { CollectibleOrb } from "@/components/token/collectible-orb";
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
import { staggerStyle } from "@/lib/motion";
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

/** Shared ready/confirm center: mint orb + staggered title/body. */
function ClaimHoldChrome({
  orbSrc,
  orbAlt,
  pulsing,
  onOrbClick,
  orbAriaLabel,
  title,
  body,
  extra,
  dock,
}: {
  orbSrc: string | null;
  orbAlt: string;
  pulsing: boolean;
  onOrbClick?: () => void;
  orbAriaLabel?: string;
  title: string;
  body: string;
  extra?: ReactNode;
  dock: ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex flex-1 flex-col items-center justify-center gap-5 py-6">
        <CollectibleOrb
          src={orbSrc}
          alt={orbAlt}
          size="lg"
          pulsing={pulsing}
          onClick={onOrbClick}
          ariaLabel={orbAriaLabel}
          style={staggerStyle(0)}
        />
        <MotionSection
          staggerIndex={1}
          className="w-full max-w-72 space-y-1.5 text-center"
        >
          <p className="text-base font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{body}</p>
          {extra}
        </MotionSection>
      </div>
      {dock}
    </>
  );
}

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

  return (
    <div className="flex flex-1 flex-col gap-4">
      {onBack && stage !== "confirming" ? (
        <BackLink onClick={onBack} />
      ) : null}
      <StepProgress
        step={stage === "confirm" || stage === "confirming" ? 2 : 1}
        total={2}
        labels={[copy.claimStepHold, copy.claimStepConfirm]}
      />
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
          <ClaimHoldChrome
            orbSrc={orbSrc}
            orbAlt={orbAlt}
            pulsing={false}
            title={copy.claimConfirmTitle}
            body={copy.claimConfirmBody(noun)}
            dock={
              <StickyActions animate={false}>
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
              </StickyActions>
            }
          />
        ) : null}

        {stage === "ready" ? (
          <ClaimHoldChrome
            orbSrc={orbSrc}
            orbAlt={orbAlt}
            pulsing
            onOrbClick={() => void onCapture()}
            orbAriaLabel={copy.holdToAdd}
            title={title}
            body={copy.claimReadyBody(noun)}
            extra={error ? <InlineError>{error}</InlineError> : null}
            dock={
              <StickyActions animate={false}>
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  onClick={() => void onCapture()}
                >
                  {error ? "Try again" : copy.holdToAdd}
                </Button>
              </StickyActions>
            }
          />
        ) : null}
      </StageTransition>
    </div>
  );
}
