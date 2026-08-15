"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authenticatePasskeyForTransfer,
  beginTransfer,
  completeTransfer,
} from "phygital-token-sdk";
import {
  CheckCircle2,
  Nfc,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { queryKeys } from "@/lib/queries";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { sendTransaction } from "@/lib/solana/tx";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";

type Stage = "ready" | "reading" | "confirming" | "done";

/**
 * Claim an unowned phygital asset to the connected wallet (passkey transfer).
 */
export function ClaimPanel({
  asset,
  unclaimed = false,
  onClaimed,
}: {
  asset: PhygitalAsset;
  /** True when owner is still the default (never claimed) pubkey. */
  unclaimed?: boolean;
  onClaimed?: () => void;
}) {
  const recipient = useWalletKitSigner();
  const queryClient = useQueryClient();
  const assetKey = queryKeys.asset.byPk(asset.secp256r1PublicKey);

  const [stage, setStage] = useState<Stage>("ready");
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const claim = useMutation<{ signature: string }, Error, void>({
    mutationFn: async () => {
      if (!recipient) throw new Error("Connect your wallet to continue.");
      let phase: "reading" | "confirming" = "reading";
      try {
        const session = await beginTransfer({
          rpc: getSolanaRpc(),
          asset: asset.asset,
        });
        const auth = await authenticatePasskeyForTransfer(session);
        phase = "confirming";
        setStage("confirming");
        const instructions = await completeTransfer(
          session,
          auth,
          recipient.address,
        );
        return await sendTransaction({
          instructions,
          feePayer: recipient,
        });
      } catch (err) {
        const next = err instanceof Error ? err : new Error("Claim failed");
        (next as Error & { phase?: "reading" | "confirming" }).phase = phase;
        throw next;
      }
    },
    onMutate: async () => {
      setError(null);
      setStage("reading");
      await queryClient.cancelQueries({ queryKey: assetKey });
    },
    onError: (err) => {
      const phase = (err as Error & { phase?: "reading" | "confirming" }).phase;
      setStage("ready");
      setError(
        phase === "reading"
          ? "Couldn’t read the NFC device. Turn on NFC and hold it near the back of your phone."
          : err.message ||
              "That tap didn’t go through. Hold the NFC device near your phone again.",
      );
    },
    onSuccess: (result) => {
      setSignature(result.signature);
      setStage("done");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: assetKey });
    },
  });

  if (stage === "done" && signature) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-medium text-foreground">It’s on this phone</p>
          <p className="max-w-60 text-sm text-muted-foreground">
            Next, choose how much this NFC device can spend.
          </p>
        </div>
        <a
          href={explorerTxUrl(signature)}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          View on Explorer
        </a>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            void queryClient.invalidateQueries({ queryKey: assetKey });
            onClaimed?.();
          }}
        >
          Continue
        </Button>
      </div>
    );
  }

  if (stage === "reading" || stage === "confirming") {
    return (
      <NfcHoldStatus
        title={
          stage === "confirming" ? "Approve to finish" : "Hold your NFC device close"
        }
        body={
          stage === "confirming"
            ? "Confirm in your account to add this NFC device."
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
          <ShieldAlert className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {unclaimed ? "Add to this phone" : "Move to this phone"}
        </p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          {unclaimed
            ? "No one has added this NFC device yet. Add it to your signed-in account to turn on Pay."
            : "This NFC device is unlocked. Add it to your signed-in account to turn on Pay."}
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full"
        disabled={!recipient || claim.isPending}
        onClick={() => claim.mutate()}
      >
        <Nfc className="size-4" />
        {error ? "Try again" : "Add to this phone"}
      </Button>
    </div>
  );
}
