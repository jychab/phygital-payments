"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Fingerprint } from "lucide-react";

import { AccessoryHome } from "@/components/accessory/accessory-home";
import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { ExpiryCountdown } from "@/components/shared/expiry-countdown";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { consumePendingClaim } from "@/lib/accessory/pending-claim-client";
import { usePendingClaim } from "@/hooks/accessory/use-pending-claim";
import { usePhygitalTokenByAddress } from "@/hooks/accessory/use-phygital-token";
import { assertClaimReady, finishClaim } from "@/lib/accessory/claim";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  invalidateOwnerQueries,
  invalidatePhygitalTokenQueries,
  queryKeys,
} from "@/lib/queries";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { address as toAddress } from "@solana/kit";

type Phase = "confirming" | "done" | null;

/** `/accessory?token=` — confirm claim with Face ID, then owned-accessory home. */
export function FinishClaimPanel() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const claimToken = searchParams.get("token")?.trim() ?? "";

  const { address, isConnected, ready, connect, session } = useSmartWallet();

  const pendingQuery = usePendingClaim(claimToken || null);
  const pending = pendingQuery.data;
  const tokenQuery = usePhygitalTokenByAddress(pending?.session.token ?? null);

  const [phase, setPhase] = useState<Phase>(null);
  const [error, setError] = useState<string | null>(null);
  const [claimedOwner, setClaimedOwner] = useState<string | null>(null);

  async function onFinish() {
    if (!session || !address || !pending) return;
    setError(null);

    const phygitalToken = tokenQuery.data;
    if (!phygitalToken) {
      setError("Still loading accessory info. Try again in a moment.");
      return;
    }

    try {
      assertClaimReady(phygitalToken, session.vaultPda);
    } catch (err) {
      setError(
        toUserErrorMessage(err, "Couldn’t add this accessory. Try again."),
      );
      return;
    }

    setPhase("confirming");
    try {
      const { session: transferSession, auth } = pending;
      await finishClaim({ session: transferSession, auth, smartWallet: session });
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
          "That didn't go through. Confirm with Face ID and try again.",
        ),
      );
    }
  }

  if (!claimToken) {
    return (
      <GateMessage
        icon={<Fingerprint className="size-5 text-destructive" />}
        title="Can’t finish"
        body="This link is missing. Hold your accessory to your phone again."
        destructive
      />
    );
  }

  if (phase === "confirming") {
    return (
      <NfcHoldStatus
        title="Confirm with Face ID…"
        body="Approve the passkey prompt to continue."
        busy
      />
    );
  }

  if (phase === "done" && claimedOwner && tokenQuery.data) {
    return (
      <AccessoryHome
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
        icon={<Fingerprint className="size-5 text-destructive" />}
        title="Can’t finish"
        body={toUserErrorMessage(
          pendingQuery.error,
          "This expired. Hold your accessory to your phone again.",
        )}
        destructive
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <div className="space-y-1.5 text-center">
        <p className="text-base font-medium text-foreground">
          Create a passkey
        </p>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          This passkey will own the accessory. Confirm with Face ID — network
          fees are covered.
        </p>
      </div>

      <ExpiryCountdown
        expiresAtMs={pending.expiresAtMs}
        className="text-center text-xs text-muted-foreground"
      />

      {!ready ? (
        <CenteredStatus>
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </CenteredStatus>
      ) : !isConnected || !address ? (
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
            disabled={!session || tokenQuery.isPending}
            onClick={() => void onFinish()}
          >
            {error ? "Try again" : "Confirm with Face ID"}
          </Button>
        </div>
      )}
    </div>
  );
}
