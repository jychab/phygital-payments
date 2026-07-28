"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { address, type Address } from "@solana/kit";
import {
  AlertCircle,
  Check,
  LoaderCircle,
  Nfc,
  Plus,
  WalletCards,
} from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { Button } from "@/components/ui/button";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { uiAmountToRaw } from "@/lib/payments/fund";
import type { PaymentRequest } from "@/lib/payments/payment-request";
import {
  isSponsoredSubmitAvailable,
  type ReceiveTransferContext,
} from "@/lib/payments/receive";
import { getUsdcMint } from "@/lib/payments/usdc";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useRecipientAtaStatus } from "@/hooks/use-recipient-ata-status";
import { useCreateAtaMutation } from "@/hooks/use-create-ata-mutation";
import { useReceiveMutation } from "@/hooks/use-receive-mutation";
import { useWalletKitSigner } from "@/lib/wallet/bridge-signer";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

type Phase = "idle" | "awaiting-tap" | "confirming";

function shortAddress(value: string, length = 4): string {
  return `${value.slice(0, length)}…${value.slice(-length)}`;
}

function tryAddress(value: string): Address | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    return address(trimmed);
  } catch {
    return null;
  }
}

export function ReceivePanel({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const { address: walletAddress } = useSolanaAddress();
  const signer = useWalletKitSigner();
  const [amount, setAmount] = useState(paymentRequest.amount ?? "");
  const [phase, setPhase] = useState<Phase>("idle");

  const sponsoredAvailable = isSponsoredSubmitAvailable();
  const mint = paymentRequest.mint;
  const amountLocked = Boolean(paymentRequest.amount);
  const mintLabel = mint === getUsdcMint() ? "USDC" : shortAddress(mint, 6);

  // Recipient is derived, never typed: the parent vault wallet takes priority,
  // then a recipient carried by a payment link.
  const recipientFromVault = Boolean(walletAddress);
  const recipient = useMemo(
    () => tryAddress(walletAddress ?? paymentRequest.recipient ?? ""),
    [walletAddress, paymentRequest.recipient],
  );

  const mintQuery = useMintProgram(mint);
  const ataQuery = useRecipientAtaStatus(
    recipient ?? null,
    mint,
    mintQuery.data?.program,
  );
  const ataStatus = ataQuery.data ?? null;
  const ataLoading = Boolean(recipient) && ataQuery.isLoading;
  const readyToReceive = ataStatus?.exists === true;
  const missingAta = ataStatus != null && !ataStatus.exists;

  const createAta = useCreateAtaMutation(mint, {
    onSuccess: () => toast.success("USDC account ready"),
  });
  const receive = useReceiveMutation({
    onSuccess: (signature) => {
      toast.success("Payment received", {
        description: (
          <a
            className="underline"
            href={explorerTxUrl(signature)}
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        ),
      });
      if (!amountLocked) setAmount("");
    },
  });

  const busy = phase !== "idle" || createAta.isPending;

  async function onCreateAccount() {
    if (!recipient) return;
    try {
      await createAta.mutateAsync({ recipient });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t create USDC account",
      );
    }
  }

  async function onReceive() {
    if (!recipient) {
      toast.error("No recipient — open this from your vault");
      return;
    }
    if (!sponsoredAvailable) {
      toast.error("Sponsored submit is not configured");
      return;
    }
    if (!readyToReceive || !ataStatus || !mintQuery.data) {
      toast.error("The recipient needs a USDC account before receiving");
      return;
    }
    setPhase("awaiting-tap");
    try {
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      const context: ReceiveTransferContext = {
        tokenProgram: ataStatus.program,
        recipientAta: ataStatus.ata,
      };
      setPhase("confirming");
      await receive.mutateAsync({ recipient, rawAmount, mint, context });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payment didn’t go through",
      );
    } finally {
      setPhase("idle");
    }
  }

  if (phase === "awaiting-tap" || phase === "confirming") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
        <div className="relative flex size-28 items-center justify-center">
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full border border-primary/25",
              "motion-safe:animate-[wallet-pulse_2.2s_ease-out_infinite]",
            )}
          />
          <span
            aria-hidden
            className={cn(
              "absolute inset-3 rounded-full border border-primary/40",
              "motion-safe:animate-[wallet-pulse_2.2s_ease-out_infinite_0.35s]",
            )}
          />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            {phase === "confirming" ? (
              <LoaderCircle className="size-7 animate-spin" />
            ) : (
              <Nfc className="size-7" />
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            {phase === "confirming" ? "Confirming…" : "Hold your pass close"}
          </p>
          <p className="text-sm text-muted-foreground">
            {phase === "confirming" ? (
              "Submitting…"
            ) : (
              <>
                Collecting{" "}
                <span className="tabular-nums text-foreground">
                  {amount || "0"}
                </span>{" "}
                {mintLabel}
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {recipient ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/35 px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">
            {recipientFromVault ? "Into your wallet" : "To recipient"}
          </span>
          <span className="font-mono text-foreground">
            {shortAddress(recipient, 6)}
          </span>
        </div>
      ) : null}

      {recipient ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3",
            readyToReceive
              ? "border-primary/25 bg-primary/8"
              : ataLoading
              ? "border-border/50 bg-muted/20"
              : "border-destructive/40 bg-destructive/8",
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
              readyToReceive
                ? "bg-primary/20 text-primary"
                : ataLoading
                ? "bg-muted text-muted-foreground"
                : "bg-destructive/15 text-destructive",
            )}
          >
            {ataLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : readyToReceive ? (
              <Check className="size-4" strokeWidth={2.5} />
            ) : (
              <AlertCircle className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {ataLoading
                ? "Checking…"
                : readyToReceive
                ? "Ready to receive"
                : "No USDC account"}
            </p>
            {missingAta && !ataLoading && !signer ? (
              <p className="text-xs text-muted-foreground">
                Open from your vault to set one up.
              </p>
            ) : null}
            {missingAta && !ataLoading && signer ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5"
                onClick={onCreateAccount}
                disabled={busy}
              >
                {createAta.isPending ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Creating…
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Create USDC account
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <WalletCards className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              Open from your vault to receive.
            </p>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col",
          !readyToReceive && "pointer-events-none opacity-45",
        )}
      >
        <div className="flex flex-1 items-start justify-center py-4">
          <AmountField
            id="receive-amount"
            value={amount}
            onChange={setAmount}
            currency={mintLabel}
            disabled={amountLocked || !readyToReceive || busy}
            autoFocus={readyToReceive && !amountLocked}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            className="h-11 w-full text-[0.9375rem]"
            onClick={onReceive}
            disabled={busy || !amount || !readyToReceive || !sponsoredAvailable}
          >
            <Nfc className="size-4" />
            Tap to receive
          </Button>
          {!sponsoredAvailable ? (
            <p className="text-center text-xs text-muted-foreground">
              Sponsored submit isn’t configured for this deployment.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
