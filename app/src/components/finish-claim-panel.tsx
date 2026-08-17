"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LoaderCircle, Wallet } from "lucide-react";
import Link from "next/link";
import { address as toAddress } from "@solana/kit";

import { AppCard, AppShell } from "@/components/app-shell";
import { CenteredStatus, GateMessage, SuccessStatus } from "@/components/gate-message";
import { ExpiryCountdown } from "@/components/expiry-countdown";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { consumePendingClaim } from "@/lib/claim/pending-claim-client";
import { usePendingClaim } from "@/hooks/use-pending-claim";
import { usePhygitalAssetByAddress } from "@/hooks/use-phygital-asset";
import { assertClaimReady, finishClaim } from "@/lib/payments/claim";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { queryKeys } from "@/lib/queries";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";

type Phase = "confirming" | "done" | null;

export function FinishClaimPanel() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const token = searchParams.get("token")?.trim() ?? "";

  const { address, isConnected, ready, connect } = useSolanaAddress();
  const signer = useWalletKitSigner();

  const pendingQuery = usePendingClaim(token || null);
  const pending = pendingQuery.data;
  const assetQuery = usePhygitalAssetByAddress(pending?.asset ?? null);

  const [phase, setPhase] = useState<Phase>(null);
  const [error, setError] = useState<string | null>(null);

  async function onFinish() {
    if (!signer || !address || !pending) return;
    setError(null);

    const asset = assetQuery.data;
    if (!asset) {
      setError("Still loading device info. Try again in a moment.");
      return;
    }

    try {
      assertClaimReady(asset, signer.address);
    } catch (err) {
      console.error("[finish-claim] pre-submit check failed", err);
      setError(toUserErrorMessage(err, "Couldn’t add this NFC device. Try again."));
      return;
    }

    setPhase("confirming");
    try {
      await finishClaim({
        asset: toAddress(pending.asset),
        slotNumber: pending.slotNumber,
        auth: pending.auth,
        recipient: signer,
      });
      try {
        await consumePendingClaim(token);
      } catch {
        /* KV cleanup is best-effort after a confirmed transfer. */
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.asset.byAddress(pending.asset),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.asset.byIdentifier(asset.identifier),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.asset.byOwner(address),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.pendingClaim.byToken(token),
        }),
      ]);

      setPhase("done");
    } catch (err) {
      console.error("[finish-claim] finishClaim failed", {
        error: err,
        message: err instanceof Error ? err.message : String(err),
        cause: err instanceof Error ? err.cause : undefined,
      });
      setPhase(null);
      setError(
        toUserErrorMessage(
          err,
          "That didn’t go through. Approve in your wallet and try again.",
        ),
      );
    }
  }

  if (!token) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-destructive" />}
        title="Can’t finish claim"
        body="Missing finish link. Tap your NFC device again in Safari."
        destructive
      />
    );
  }

  if (phase === "confirming") {
    return (
      <NfcHoldStatus
        title="Confirm in wallet…"
        body="Approve the transaction in your wallet."
        busy
      />
    );
  }

  if (phase === "done") {
    return (
      <div className="flex flex-1 flex-col gap-5 py-2">
        <SuccessStatus
          icon={<CheckCircle2 className="size-7" />}
          title="Device added"
          body="Next, open Home to set a spending limit and pay with this wallet."
          bodyClassName="max-w-64"
        />
        <Button type="button" size="lg" className="w-full" asChild>
          <Link href="/">Open Home</Link>
        </Button>
      </div>
    );
  }

  if (pendingQuery.isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading tap proof…</p>
      </CenteredStatus>
    );
  }

  if (pendingQuery.isError || !pending) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-destructive" />}
        title="Can’t finish claim"
        body={toUserErrorMessage(
          pendingQuery.error,
          "Tap proof expired. Tap your NFC device again in Safari.",
        )}
        destructive
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 py-2">
      <div className="space-y-1.5 text-center">
        <p className="text-base font-medium text-foreground">Finish adding device</p>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          Connect the wallet that should own this NFC device, then confirm. You’ll
          pay a small network fee.
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
          body="This wallet will be linked to the device."
          action={
            <Button
              type="button"
              size="lg"
              className="w-full max-w-64"
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
            disabled={!signer || assetQuery.isPending}
            onClick={() => void onFinish()}
          >
            {error ? "Try again" : "Confirm in wallet"}
          </Button>
        </div>
      )}
    </div>
  );
}

export function FinishClaimApp() {
  return (
    <AppShell walletActions="full" modeLabel="Device">
      <AppCard>
        <FinishClaimPanel />
      </AppCard>
    </AppShell>
  );
}
