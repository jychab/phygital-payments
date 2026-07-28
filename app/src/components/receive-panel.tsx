"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { address } from "@solana/kit";
import { Check, LoaderCircle, Nfc, WalletCards } from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { sendTransaction } from "@/lib/solana/tx";
import { resolveMintProgram, uiAmountToRaw } from "@/lib/payments/fund";
import type { PaymentRequest } from "@/lib/payments/payment-request";
import {
  buildCreateRecipientAtaInstructions,
  fetchRecipientAtaStatus,
  isSponsoredSubmitAvailable,
  receiveTransfer,
  type ReceiveSubmitMode,
  type ReceiveTransferContext,
  type RecipientAtaStatus,
} from "@/lib/payments/receive";
import { getUsdcMint } from "@/lib/payments/usdc";
import { useWalletKitSigner } from "@/lib/wallet/privy-signer";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

type Phase = "idle" | "creating-ata" | "awaiting-tap" | "confirming";

function shortAddress(value: string, length = 4): string {
  return `${value.slice(0, length)}…${value.slice(-length)}`;
}

export function ReceivePanel({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const signer = useWalletKitSigner();
  const { address: walletAddress, isConnected } = useSolanaAddress();
  const [amount, setAmount] = useState(paymentRequest.amount ?? "");
  const [phase, setPhase] = useState<Phase>("idle");
  const [submitMode, setSubmitMode] = useState<ReceiveSubmitMode>("client");
  const [confirmingMode, setConfirmingMode] =
    useState<ReceiveSubmitMode>("sponsored");
  const [recipientStatus, setRecipientStatus] = useState<
    (RecipientAtaStatus & { decimals: number }) | null
  >(null);
  const [ataLoading, setAtaLoading] = useState(false);
  const sponsoredAvailable = isSponsoredSubmitAvailable();
  const mint = paymentRequest.mint;
  const busy = phase !== "idle";
  const amountLocked = Boolean(paymentRequest.amount);
  const mintLabel = mint === getUsdcMint() ? "USDC" : shortAddress(mint, 6);
  const settlesTo = walletAddress ? address(walletAddress) : null;
  const settlesToConnected =
    !!walletAddress && !!settlesTo && settlesTo === walletAddress;
  const canCreateAta = settlesToConnected;
  const readyToReceive = recipientStatus?.exists === true;

  const refreshAta = useCallback(async () => {
    if (!settlesTo) {
      setRecipientStatus(null);
      return;
    }
    setAtaLoading(true);
    try {
      const { program, decimals } = await resolveMintProgram(mint);
      const status = await fetchRecipientAtaStatus({
        mint,
        owner: settlesTo,
        program,
      });
      setRecipientStatus({ ...status, decimals });
    } catch (error) {
      console.error(error);
      setRecipientStatus(null);
    } finally {
      setAtaLoading(false);
    }
  }, [mint, settlesTo]);

  useEffect(() => {
    void refreshAta();
  }, [refreshAta]);

  async function onCreateAta() {
    if (!signer || !isConnected || !settlesToConnected) {
      toast.error(
        settlesToConnected
          ? "Connect a wallet first"
          : "Connect as the recipient to create their USDC account",
      );
      return;
    }
    setPhase("creating-ata");
    try {
      const { instructions } = await buildCreateRecipientAtaInstructions({
        signer,
        mint,
        owner: settlesTo ?? undefined,
      });
      if (instructions.length === 0) {
        await refreshAta();
        toast.message("USDC account already ready");
        return;
      }
      const { signature } = await sendTransaction({
        instructions,
        feePayer: signer,
      });
      await refreshAta();
      toast.success("USDC account created", {
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
      await refreshAta();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn’t create USDC account",
      );
    } finally {
      setPhase("idle");
    }
  }

  async function onReceive() {
    if (!signer || !isConnected) {
      toast.error("Connect a wallet first");
      return;
    }
    if (!readyToReceive || !recipientStatus) {
      toast.error("Create a USDC account before receiving");
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
      setConfirmingMode(submitMode);
      const { signature } = await receiveTransfer({
        signer,
        rawAmount,
        mint,
        context: transferContext,
        mode: submitMode,
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
              confirmingMode === "sponsored" ? (
                "Submitting with sponsored fees…"
              ) : (
                "Approve in your wallet if asked."
              )
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
          {settlesToConnected ? (
            <span className="text-foreground">this wallet</span>
          ) : settlesTo ? (
            <span className="font-mono text-[12px] text-foreground">
              {shortAddress(settlesTo, 6)}
            </span>
          ) : (
            <span className="text-foreground">the recipient</span>
          )}
          .
        </p>
        {paymentRequest.fromUrl ? (
          <p className="text-xs text-muted-foreground/80">
            Prefilled from payment link · {mintLabel}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3",
          readyToReceive
            ? "border-primary/25 bg-primary/8"
            : "border-border/50 bg-muted/20",
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
            readyToReceive
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {ataLoading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : readyToReceive ? (
            <Check className="size-4" strokeWidth={2.5} />
          ) : (
            <WalletCards className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-foreground">
            {ataLoading
              ? "Checking USDC account…"
              : readyToReceive
              ? "USDC account ready"
              : "USDC account required"}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {readyToReceive
              ? "This wallet can receive payment."
              : canCreateAta
              ? "Create a USDC token account once, then you can collect payments."
              : settlesTo
              ? "The recipient must create their USDC account before you can continue."
              : "Connect a wallet to set up receiving."}
          </p>
          {!readyToReceive && canCreateAta ? (
            <Button
              type="button"
              size="sm"
              className="mt-2"
              onClick={onCreateAta}
              disabled={!isConnected || busy || ataLoading}
            >
              {phase === "creating-ata" ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create USDC account"
              )}
            </Button>
          ) : null}
        </div>
      </div>

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

        {sponsoredAvailable ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2.5">
            <div className="space-y-0.5">
              <Label
                htmlFor="sponsored-fees"
                className="text-sm font-medium text-foreground"
              >
                Sponsored fees
              </Label>
              <p className="text-xs text-muted-foreground">
                Off: you pay network fees and submit immediately.
              </p>
            </div>
            <input
              id="sponsored-fees"
              type="checkbox"
              checked={submitMode === "sponsored"}
              onChange={(e) =>
                setSubmitMode(e.target.checked ? "sponsored" : "client")
              }
              disabled={busy}
              className="size-4 rounded border-input accent-primary"
            />
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-3">
          <Button
            type="button"
            size="lg"
            className="h-11 w-full text-[0.9375rem]"
            onClick={onReceive}
            disabled={!isConnected || busy || !amount || !readyToReceive}
          >
            <Nfc className="size-4" />
            Tap to receive
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            {submitMode === "sponsored"
              ? "Tap your pass, then the fee payer submits the transfer."
              : "Tap your pass, then confirm in your wallet."}
          </p>
        </div>
      </div>
    </div>
  );
}
