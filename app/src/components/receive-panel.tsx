"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  ExternalLink,
  LoaderCircle,
  Nfc,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { CopyableAddress } from "@/components/copyable-address";
import { Button } from "@/components/ui/button";
import { explorerTxUrl } from "@/lib/solana/cluster";
import { uiAmountToRaw } from "@/lib/payments/usdc-allowance";
import {
  tryParseAddress,
  type PaymentRequest,
} from "@/lib/payments/payment-request";
import {
  isSponsoredSubmitAvailable,
  type ReceiveTransferContext,
} from "@/lib/payments/receive";
import { getUsdcMint } from "@/lib/payments/usdc";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useRecipientAtaStatus } from "@/hooks/use-recipient-ata-status";
import { useCreateAtaMutation } from "@/hooks/use-create-ata-mutation";
import { useReceiveMutation } from "@/hooks/use-receive-mutation";
import { useWalletKitSigner } from "@/lib/wallet/wallet-kit-signer";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn, shortAddress } from "@/lib/utils";

type Phase = "idle" | "awaiting-tap" | "confirming" | "success";

const SUCCESS_HOLD_MS = 3200;

export function ReceivePanel({
  paymentRequest,
  fixedRecipient = null,
  intoOwnWallet = false,
  walletConnectEnabled = true,
}: {
  paymentRequest: PaymentRequest;
  /** Resolved recipient — connected wallet or `?recipient=`. */
  fixedRecipient?: string | null;
  /** True when settling into the connected wallet. */
  intoOwnWallet?: boolean;
  /** False in iframe embeds — no Privy connect / ATA-create via wallet. */
  walletConnectEnabled?: boolean;
}) {
  const signer = useWalletKitSigner();
  const { connect, isConnected } = useSolanaAddress();
  const [amount, setAmount] = useState(paymentRequest.amount ?? "");
  const [phase, setPhase] = useState<Phase>("idle");
  // Amount captured at submit time so the success screen keeps showing it even
  // after the input resets.
  const [settledAmount, setSettledAmount] = useState("");
  const [failMessage, setFailMessage] = useState<string | null>(null);

  const sponsoredAvailable = isSponsoredSubmitAvailable();
  const mint = paymentRequest.mint;
  const amountLocked = Boolean(paymentRequest.amount);
  const mintLabel = mint === getUsdcMint() ? "USDC" : shortAddress(mint, 6);

  const recipient = useMemo(
    () => tryParseAddress(fixedRecipient ?? ""),
    [fixedRecipient],
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
    onSuccess: () => toast.success("Ready to receive"),
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
    if (!walletConnectEnabled) return;
    if (!signer) {
      connect();
      return;
    }
    try {
      await createAta.mutateAsync({ recipient });
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t set up to receive"));
    }
  }

  async function onReceive() {
    if (!recipient) {
      setFailMessage("No recipient set.");
      return;
    }
    if (!sponsoredAvailable) {
      setFailMessage("Payments aren’t available right now.");
      return;
    }
    if (!readyToReceive || !ataStatus || !mintQuery.data) {
      setFailMessage("Set up to receive before collecting a payment.");
      return;
    }
    const paidAmount = amount;
    setFailMessage(null);
    // Stay on hold through WebAuthn — only flip to Confirming after the tap.
    setPhase("awaiting-tap");
    try {
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      const context: ReceiveTransferContext = {
        tokenProgram: ataStatus.program,
        recipientAta: ataStatus.ata,
      };
      await receive.mutateAsync({
        recipient,
        rawAmount,
        mint,
        context,
        onPasskeyComplete: () => {
          setPhase("confirming");
          try {
            navigator.vibrate?.(30);
          } catch {
            /* ignore */
          }
        },
      });
      setSettledAmount(paidAmount);
      setPhase("success");
      try {
        navigator.vibrate?.([20, 40, 20]);
      } catch {
        /* ignore */
      }
      if (!amountLocked) setAmount("");
      window.setTimeout(() => setPhase("idle"), SUCCESS_HOLD_MS);
    } catch (error) {
      setFailMessage(
        toUserErrorMessage(error, "Payment didn’t go through. Try again."),
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setPhase("idle")}
        >
          Done
        </Button>
      </div>
    );
  }

  if (phase === "awaiting-tap" || phase === "confirming") {
    return (
      <div className="flex flex-1 flex-col py-6 text-center">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Receiving
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
          <p className="font-(family-name:--font-display) text-xl tracking-tight">
            {phase === "confirming" ? "Confirming…" : "Hold their NFC device close"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {intoOwnWallet ? (
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium text-foreground">Collect</p>
          <p className="text-xs text-muted-foreground">
            Enter an amount, then hold their NFC device to your phone.
          </p>
        </div>
      ) : null}

      {recipient ? (
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

      {recipient && (ataLoading || missingAta) ? (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3",
            ataLoading
              ? "border-border/50 bg-muted/20"
              : "border-border/60 bg-muted/25",
          )}
        >
          <div
            className={cn(
              "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
              ataLoading
                ? "bg-muted text-muted-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {ataLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <AlertCircle className="size-4" />
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {ataLoading ? "Checking…" : "Set up to receive"}
            </p>
            {missingAta && !ataLoading && !walletConnectEnabled ? (
              <>
                <p className="text-xs text-muted-foreground">
                 Click the link below and connect to the receiver wallet. You only need to do this once.
                </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    asChild
                  >
                    <a
                      href={"/"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-3.5" />
                      Open to finish setup
                    </a>
                  </Button>
              </>
            ) : null}
            {missingAta &&
            !ataLoading &&
            walletConnectEnabled &&
            !isConnected ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Sign in once to set up receiving for this address.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5"
                  onClick={connect}
                  disabled={busy}
                >
                  <Wallet className="size-3.5" />
                  Sign in
                </Button>
              </>
            ) : null}
            {missingAta &&
            !ataLoading &&
            walletConnectEnabled &&
            isConnected ? (
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5"
                onClick={onCreateAccount}
                disabled={busy || !signer}
              >
                {createAta.isPending ? (
                  <>
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Setting up…
                  </>
                ) : (
                  <>
                    <Plus className="size-3.5" />
                    Set up to receive
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {recipient && readyToReceive ? (
        <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <Check className="size-3 text-primary/80" strokeWidth={2.5} />
          Ready to receive
        </p>
      ) : null}

      {!recipient ? (
        <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Wallet className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-muted-foreground">
              Sign in to receive.
            </p>
          </div>
        </div>
      ) : null}

      {failMessage ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-center">
          <p className="text-xs text-destructive">{failMessage}</p>
        </div>
      ) : null}

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
            onChange={(next) => {
              setFailMessage(null);
              setAmount(next);
            }}
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
            Hold NFC device to receive
          </Button>
          {sponsoredAvailable ? (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary/80" />
              No fee
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Payments aren’t available right now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
