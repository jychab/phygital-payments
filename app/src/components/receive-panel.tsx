"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  LoaderCircle,
  Nfc,
  Plus,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { CopyableAddress } from "@/components/copyable-address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { uiAmountToRaw } from "@/lib/payments/fund";
import {
  tryParseAddress,
  type PaymentRequest,
} from "@/lib/payments/payment-request";
import {
  isSponsoredSubmitAvailable,
  type ReceiveTransferContext,
} from "@/lib/payments/receive";
import { getUsdcMint } from "@/lib/payments/usdc";
import { warmSubmitter } from "@/lib/payments/submitter-client";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useRecipientAtaStatus } from "@/hooks/use-recipient-ata-status";
import { useCreateAtaMutation } from "@/hooks/use-create-ata-mutation";
import { useReceiveMutation } from "@/hooks/use-receive-mutation";
import { useSlotHashPrefetch } from "@/hooks/use-slot-hash-prefetch";
import { useWalletKitSigner } from "@/lib/wallet/bridge-signer";
import { cn, shortAddress } from "@/lib/utils";

type Phase = "idle" | "awaiting-tap" | "confirming" | "success";

export function ReceivePanel({
  paymentRequest,
  editableRecipient = false,
  manualRecipient = "",
  onManualRecipientChange,
  fixedRecipient = null,
  intoOwnWallet = false,
}: {
  paymentRequest: PaymentRequest;
  /** When true (standalone, no `?recipient=`), recipient is typed inline. */
  editableRecipient?: boolean;
  manualRecipient?: string;
  onManualRecipientChange?: (value: string) => void;
  /** The resolved recipient when not editable — connected wallet or `?recipient=`. */
  fixedRecipient?: string | null;
  /** True when settling into the connected wallet (embedded), for the label. */
  intoOwnWallet?: boolean;
}) {
  const signer = useWalletKitSigner();
  const [amount, setAmount] = useState(paymentRequest.amount ?? "");
  const [phase, setPhase] = useState<Phase>("idle");
  // Amount captured at submit time so the success screen keeps showing it even
  // after the input resets.
  const [settledAmount, setSettledAmount] = useState("");

  const sponsoredAvailable = isSponsoredSubmitAvailable();
  const mint = paymentRequest.mint;
  const amountLocked = Boolean(paymentRequest.amount);
  const mintLabel = mint === getUsdcMint() ? "USDC" : shortAddress(mint, 6);

  // Recipient the payment settles into: the typed address when editable,
  // otherwise the resolved wallet / URL recipient passed from the parent.
  const recipient = useMemo(
    () =>
      editableRecipient
        ? tryParseAddress(manualRecipient)
        : tryParseAddress(fixedRecipient ?? ""),
    [editableRecipient, manualRecipient, fixedRecipient],
  );
  const manualInvalid =
    editableRecipient && manualRecipient.trim().length > 0 && !recipient;

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

  // While armed, keep a slot hash warmed so the NFC prompt fires without an RPC.
  const getSlotHash = useSlotHashPrefetch(readyToReceive);

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
    const paidAmount = amount;
    setPhase("awaiting-tap");
    // Warm the fee-payer DO now so it's hot by the time the payload posts
    // (~1s+ later, after the tap) — hides signer/blockhash cold-start.
    void warmSubmitter();
    try {
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      const context: ReceiveTransferContext = {
        tokenProgram: ataStatus.program,
        recipientAta: ataStatus.ata,
      };
      const slotHash = getSlotHash();
      setPhase("confirming");
      await receive.mutateAsync({ recipient, rawAmount, mint, context, slotHash });
      // A calm moment of closure before returning to idle — the equivalent of
      // Apple Pay's "Done" checkmark.
      setSettledAmount(paidAmount);
      setPhase("success");
      if (!amountLocked) setAmount("");
      window.setTimeout(() => setPhase("idle"), 1800);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Payment didn’t go through",
      );
      setPhase("idle");
    }
  }

  if (phase === "success") {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-6 py-6 text-center"
        aria-live="assertive"
      >
        <div className="relative flex size-24 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-success/15 motion-safe:animate-[wallet-pulse_1.4s_ease-out]"
          />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-success text-success-foreground motion-safe:animate-[wallet-rise_0.4s_cubic-bezier(0.22,1,0.36,1)]">
            <Check className="size-8" strokeWidth={2.75} />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-semibold tracking-tight">Received</p>
          <p className="font-[family-name:var(--font-display)] text-[2.5rem] leading-none tracking-tight tabular-nums">
            {settledAmount || amount || "0"}
            <span className="ml-1.5 text-lg font-medium text-muted-foreground">
              {mintLabel}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (phase === "awaiting-tap" || phase === "confirming") {
    return (
      <div className="flex flex-1 flex-col py-6 text-center">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Transferring
          </p>
          <p className="font-[family-name:var(--font-display)] text-[2.75rem] leading-none tracking-tight tabular-nums">
            {amount || "0"}
            <span className="ml-1.5 text-xl font-medium text-muted-foreground">
              {mintLabel}
            </span>
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-6">
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
          <p className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            {phase === "confirming" ? "Confirming…" : "Hold your pass close"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {editableRecipient ? (
        <div className="space-y-1.5">
          <Label htmlFor="receive-recipient" className="text-xs text-muted-foreground">
            Recipient
          </Label>
          <Input
            id="receive-recipient"
            value={manualRecipient}
            onChange={(event) => onManualRecipientChange?.(event.target.value)}
            placeholder="Solana wallet address"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={manualInvalid}
            className="h-10 font-mono text-sm"
          />
          {manualInvalid ? (
            <p className="text-xs text-destructive">Enter a valid Solana address.</p>
          ) : null}
        </div>
      ) : recipient ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/35 px-4 py-2.5 text-xs">
          <span className="text-muted-foreground">
            {intoOwnWallet ? "Into your wallet" : "To recipient"}
          </span>
          <CopyableAddress
            address={recipient}
            length={6}
            label={intoOwnWallet ? "wallet address" : "recipient address"}
          />
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
      ) : editableRecipient ? null : (
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
          {sponsoredAvailable ? (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary/80" />
              No network fee — settles directly on Solana
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Fee-free payments are unavailable right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
