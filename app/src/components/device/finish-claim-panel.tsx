"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Wallet } from "lucide-react";

import { DeviceHome } from "@/components/device/device-home";
import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { ExpiryCountdown } from "@/components/shared/expiry-countdown";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { consumePendingClaim } from "@/lib/device/pending-claim-client";
import { usePendingClaim } from "@/hooks/device/use-pending-claim";
import { usePhygitalTokenByAddress } from "@/hooks/device/use-phygital-token";
import { assertClaimReady, finishClaim } from "@/lib/device/claim";
import { toUserErrorMessage } from "@/lib/user-errors";
import { invalidateOwnerQueries, queryKeys } from "@/lib/queries";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";
import { address as toAddress } from "@solana/kit";

type Phase = "confirming" | "done" | null;

/** `/device?token=` — confirm claim in the wallet, then owned-device home. */
export function FinishClaimPanel() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const claimToken = searchParams.get("token")?.trim() ?? "";

  const { address, isConnected, ready, connect } = useSolanaAddress();
  const signer = useWalletKitSigner();

  const pendingQuery = usePendingClaim(claimToken || null);
  const pending = pendingQuery.data;
  const tokenQuery = usePhygitalTokenByAddress(pending?.session.token ?? null);

  const [phase, setPhase] = useState<Phase>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);

  async function onFinish() {
    if (!signer || !address || !pending) return;
    setError(null);

    const phygitalToken = tokenQuery.data;
    if (!phygitalToken) {
      setError("Still loading device info. Try again in a moment.");
      return;
    }

    try {
      assertClaimReady(phygitalToken, signer.address);
    } catch (err) {
      setError(
        toUserErrorMessage(err, "Couldn’t add this device. Try again."),
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
        queryClient.invalidateQueries({
          queryKey: queryKeys.phygitalToken.byAddress(pending.session.token),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.phygitalToken.byIdentifier(
            phygitalToken.identifier,
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.phygitalToken.byPasskey(
            phygitalToken.secp256r1PublicKey,
          ),
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
        body="This link is missing. Hold your device to your phone again."
        destructive
      />
    );
  }

  if (phase === "confirming") {
    return (
      <NfcHoldStatus
        title="Confirm in wallet…"
        body="Approve in your wallet to continue."
        busy
      />
    );
  }

  if (phase === "done" && claimedOwner && tokenQuery.data) {
    return (
      <DeviceHome
        token={{
          ...tokenQuery.data,
          currentOwner: toAddress(claimedOwner),
        }}
        liveConfirmed
      />
    );
  }

  if (pendingQuery.isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </CenteredStatus>
    );
  }

  if (pendingQuery.isError || !pending) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-destructive" />}
        title="Can’t finish"
        body={toUserErrorMessage(
          pendingQuery.error,
          "This expired. Hold your device to your phone again.",
        )}
        destructive
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <div className="space-y-1.5 text-center">
        <p className="text-base font-medium text-foreground">
          Link your wallet
        </p>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          Connect the wallet that should own this device, then confirm.
          You&apos;ll pay a small network fee.
        </p>
      </div>

      <ExpiryCountdown
        expiresAtMs={pending.expiresAtMs}
        className="text-center text-xs text-muted-foreground"
      />

      {!ready ? (
        <CenteredStatus>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading wallet…</p>
        </CenteredStatus>
      ) : !isConnected || !address ? (
        <GateMessage
          icon={<Wallet className="size-5 text-muted-foreground" />}
          title="Connect your wallet"
          body="This wallet will own the device."
          action={
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={connect}
            >
              Connect wallet
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
