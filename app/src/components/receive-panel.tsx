"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { sendTransaction } from "@/lib/solana/tx";
import { resolveMintProgram, uiAmountToRaw } from "@/lib/payments/fund";
import type { PaymentRequest } from "@/lib/payments/payment-request";
import {
  buildCreateRecipientAtaInstructions,
  fetchRecipientAtaStatus,
  isSponsoredSubmitAvailable,
  receiveTransfer,
  type ReceiveTransferContext,
  type RecipientAtaStatus,
} from "@/lib/payments/receive";
import { getUsdcMint } from "@/lib/payments/usdc";
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
  const [creating, setCreating] = useState(false);
  const [recipientStatus, setRecipientStatus] = useState<
    (RecipientAtaStatus & { decimals: number }) | null
  >(null);
  const [ataLoading, setAtaLoading] = useState(false);
  const sponsoredAvailable = isSponsoredSubmitAvailable();
  const mint = paymentRequest.mint;
  const busy = phase !== "idle" || creating;
  const amountLocked = Boolean(paymentRequest.amount);
  const mintLabel = mint === getUsdcMint() ? "USDC" : shortAddress(mint, 6);

  // Recipient is derived, never typed: the parent vault wallet takes priority,
  // then a recipient carried by a payment link.
  const recipientFromVault = Boolean(walletAddress);
  const recipient = useMemo(
    () => tryAddress(walletAddress ?? paymentRequest.recipient ?? ""),
    [walletAddress, paymentRequest.recipient],
  );
  const readyToReceive = recipientStatus?.exists === true;
  const missingAta = recipientStatus != null && !recipientStatus.exists;

  const refreshAta = useCallback(async () => {
    if (!recipient) {
      setRecipientStatus(null);
      return;
    }
    setAtaLoading(true);
    try {
      const { program, decimals } = await resolveMintProgram(mint);
      const status = await fetchRecipientAtaStatus({
        mint,
        owner: recipient,
        program,
      });
      setRecipientStatus({ ...status, decimals });
    } catch (error) {
      console.error(error);
      setRecipientStatus(null);
    } finally {
      setAtaLoading(false);
    }
  }, [mint, recipient]);

  useEffect(() => {
    void refreshAta();
  }, [refreshAta]);

  async function onCreateAccount() {
    if (!recipient || !signer) {
      toast.error("Open from your vault to create a USDC account");
      return;
    }
    setCreating(true);
    try {
      const { instructions } = await buildCreateRecipientAtaInstructions({
        signer,
        owner: recipient,
      });
      if (instructions.length > 0) {
        await sendTransaction({ instructions, feePayer: signer });
      }
      toast.success("USDC account ready");
      await refreshAta();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t create USDC account",
      );
    } finally {
      setCreating(false);
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
    if (!readyToReceive || !recipientStatus) {
      toast.error("The recipient needs a USDC account before receiving");
      return;
    }
    setPhase("awaiting-tap");
    try {
      const rawAmount = uiAmountToRaw(amount, recipientStatus.decimals);
      const transferContext: ReceiveTransferContext = {
        tokenProgram: recipientStatus.program,
        recipientAta: recipientStatus.ata,
      };
      setPhase("confirming");
      const { signature } = await receiveTransfer({
        recipient,
        rawAmount,
        mint,
        context: transferContext,
      });
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
            {phase === "confirming"
              ? "Confirming…"
              : "Hold your pass near the reader"}
          </p>
          <p className="text-sm text-muted-foreground">
            {phase === "confirming" ? (
              "Submitting with sponsored fees…"
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
      <div className="space-y-2 rounded-xl bg-muted/35 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        <p>
          Payment comes from the pass owner’s allowance into{" "}
          {recipient ? (
            <span className="font-mono text-[12px] text-foreground">
              {shortAddress(recipient, 6)}
            </span>
          ) : (
            <span className="text-foreground">the recipient</span>
          )}
          .
        </p>
        {recipient ? (
          <p className="text-xs text-muted-foreground/80">
            {recipientFromVault
              ? "Paid into your vault wallet"
              : "Recipient from payment link"}{" "}
            · {mintLabel}
          </p>
        ) : null}
      </div>

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
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {ataLoading
                  ? "Checking USDC account…"
                  : readyToReceive
                  ? "USDC account ready"
                  : "No USDC account yet"}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {readyToReceive
                  ? "This wallet can receive payment."
                  : ataLoading
                  ? "Looking up the token account."
                  : signer
                  ? "Create the USDC account once — then you can receive."
                  : "This wallet needs a USDC account before it can receive. Open from your vault to create it."}
              </p>
            </div>
            {missingAta && !ataLoading && signer ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5"
                onClick={onCreateAccount}
                disabled={busy}
              >
                {creating ? (
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
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium text-foreground">No recipient</p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Open Phygital Pay from your Revibase vault to receive into your
              wallet.
            </p>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex flex-1 flex-col gap-5",
          !readyToReceive && "pointer-events-none opacity-45",
        )}
      >
        <div>
          <p className="mb-1 text-center text-xs font-medium text-muted-foreground">
            Amount to collect
          </p>
          <AmountField
            id="receive-amount"
            value={amount}
            onChange={setAmount}
            currency={mintLabel}
            disabled={amountLocked || !readyToReceive || busy}
            autoFocus={readyToReceive && !amountLocked}
          />
          {amountLocked ? (
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              Amount set by payment link
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-col gap-3">
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
          <p className="text-center text-xs text-muted-foreground">
            {sponsoredAvailable
              ? "Tap your pass, then the fee payer submits the transfer."
              : "Sponsored submit isn’t configured for this deployment."}
          </p>
        </div>
      </div>
    </div>
  );
}
