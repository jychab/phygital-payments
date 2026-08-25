"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Wallet } from "lucide-react";

import { AccessoryHome } from "@/components/accessory/accessory-home";
import { CardHome } from "@/components/card/card-home";
import { GateMessage } from "@/components/layout/gate-message";
import { BackToCollection } from "@/components/shared/back-to-collection";
import { ConnectGate } from "@/components/shared/connect-gate";
import { ExpiryCountdown } from "@/components/shared/expiry-countdown";
import { InlineError } from "@/components/shared/inline-error";
import { LoadingStatus } from "@/components/shared/loading-status";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { StepProgress } from "@/components/shared/step-progress";
import { Button } from "@/components/ui/button";
import { consumePendingClaim } from "@/lib/accessory/pending-claim-client";
import { usePendingClaim } from "@/hooks/accessory/use-pending-claim";
import { usePhygitalTokenByAddress } from "@/hooks/accessory/use-phygital-token";
import { useEnsurePhygitalSurface } from "@/hooks/phygital/use-ensure-phygital-surface";
import { assertClaimReady, finishClaim } from "@/lib/accessory/claim";
import { copy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  invalidateOwnerQueries,
  invalidatePhygitalTokenQueries,
  queryKeys,
} from "@/lib/queries";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";
import { address as toAddress } from "@solana/kit";
import {
  surfaceForToken,
  surfaceFromPathname,
} from "@/lib/phygital/surface";

type Phase = "confirming" | "done" | null;

/** Confirm claim in the wallet, then owned card or accessory home. */
export function FinishClaimPanel() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const claimToken = searchParams.get("token")?.trim() ?? "";
  const surface = surfaceFromPathname(pathname) ?? "accessory";

  const { address, isConnected, ready, connect } = useSolanaAddress();
  const signer = useWalletKitSigner();

  const pendingQuery = usePendingClaim(claimToken || null);
  const pending = pendingQuery.data;
  const tokenQuery = usePhygitalTokenByAddress(pending?.session.token ?? null);
  const mismatch = useEnsurePhygitalSurface(tokenQuery.data, surface);
  const noun = tokenQuery.data
    ? surfaceForToken(tokenQuery.data)
    : surface;

  const [phase, setPhase] = useState<Phase>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);

  async function onFinish() {
    if (!signer || !address || !pending) return;
    setError(null);

    const phygitalToken = tokenQuery.data;
    if (!phygitalToken) {
      setError(`Still loading ${noun} info. Try again in a moment.`);
      return;
    }

    try {
      assertClaimReady(phygitalToken, signer.address);
    } catch (err) {
      setError(
        toUserErrorMessage(err, `Couldn’t add this ${noun}. Try again.`),
      );
      return;
    }

    setPhase("confirming");
    try {
      const { session, auth } = pending;
      await finishClaim({ session, auth, recipient: signer });
      try {
        await consumePendingClaim(claimToken);
      } catch {
        /* KV cleanup is best-effort after a confirmed transfer. */
      }

      invalidateOwnerQueries(queryClient, address);
      await Promise.all([
        invalidatePhygitalTokenQueries(queryClient, {
          address: String(pending.session.token),
          identifier: phygitalToken.identifier,
          secp256r1PublicKey: phygitalToken.secp256r1PublicKey,
          currentOwner: address,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.pendingClaim.byToken(claimToken),
        }),
      ]);

      setClaimedOwner(address);
      setPhase("done");
    } catch (err) {
      setPhase(null);
      setError(
        toUserErrorMessage(
          err,
          "That didn't go through. Approve in your wallet and try again.",
        ),
      );
    }
  }

  if (!claimToken) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-destructive" />}
        title="Can’t finish"
        body={`This link is missing. Hold your ${noun} to your phone again.`}
        destructive
      />
    );
  }

  if (phase === "confirming") {
    return (
      <div className="flex flex-1 flex-col gap-6 py-2">
        <StepProgress
          step={2}
          total={2}
          labels={[copy.claimStepHold, copy.claimStepConfirm]}
        />
        <NfcHoldStatus
          title="Confirm in wallet…"
          body="Approve in your wallet to continue."
          busy
        />
      </div>
    );
  }

  if (phase === "done" && claimedOwner && tokenQuery.data) {
    const claimed = {
      ...tokenQuery.data,
      currentOwner: toAddress(claimedOwner),
    };
    return (
      <div className="flex flex-1 flex-col gap-4">
        <BackToCollection />
        {surfaceForToken(claimed) === "card" ? (
          <CardHome token={claimed} />
        ) : (
          <AccessoryHome token={claimed} />
        )}
      </div>
    );
  }

  if (mismatch) {
    return <LoadingStatus label="Loading…" />;
  }

  if (pendingQuery.isPending) {
    return <LoadingStatus label="Loading…" />;
  }

  if (pendingQuery.isError || !pending) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-destructive" />}
        title="Can’t finish"
        body={toUserErrorMessage(
          pendingQuery.error,
          `This link expired. Open Safari or Chrome, hold your ${noun} to your phone again, then come back to connect.`,
        )}
        destructive
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <StepProgress
        step={2}
        total={2}
        labels={[copy.claimStepHold, copy.claimStepConfirm]}
      />

      <div className="space-y-1.5 text-center">
        <p className="text-base font-medium text-foreground">
          Link your wallet
        </p>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          The hold is done — connect the wallet that should own this {noun},
          then confirm. Your wallet app is fine here. {copy.claimNetworkFee}
        </p>
      </div>

      <ExpiryCountdown
        expiresAtMs={pending.expiresAtMs}
        className="text-center text-xs text-muted-foreground"
      />

      {!ready ? (
        <LoadingStatus label="Loading wallet…" />
      ) : !isConnected || !address ? (
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
            disabled={!signer || tokenQuery.isPending}
            onClick={() => void onFinish()}
          >
            {error ? "Try again" : "Confirm in wallet"}
          </Button>
        </div>
      )}
    </div>
  );
}
