"use client";

import { useState } from "react";
import { Nfc, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { PolicyDeniedError } from "phygital-wallet-sdk";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copy } from "@/lib/copy/phygital";
import { identifyAccessory } from "@/lib/wallet/identify-accessory";
import { createOneTimeGrant } from "@/lib/wallet/policies-client";
import { sendUsdcFromWallet } from "@/lib/wallet/send-usdc";
import { shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";
import { tryParseAddress } from "@/lib/solana/address";

type Phase = "form" | "holding" | "success";

function softDenyBody(deny: PolicyDeniedError): string {
  if (deny.code === "spend_limit") {
    const limit =
      typeof deny.details?.limitUi === "string" ? deny.details.limitUi : null;
    return limit
      ? copy.wallet.approveSendBodyLimit(limit)
      : deny.message;
  }
  if (deny.code === "recipient_not_allowed") {
    return copy.wallet.approveSendBodyRecipient;
  }
  if (deny.code === "outside_time_window") {
    return copy.wallet.approveSendBodyTime;
  }
  return deny.message;
}

/** Send sheet — amount + recipient → Hold to send. */
export function SendSheet({
  phygitalTokenPda,
  availableUsd,
  onClose,
  onSent,
  onChangeLimits,
}: {
  phygitalTokenPda: string;
  availableUsd: number;
  onClose: () => void;
  onSent: () => void;
  onChangeLimits?: (code?: string) => void;
}) {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [busy, setBusy] = useState(false);
  const [hardError, setHardError] = useState<string | null>(null);
  const [softDeny, setSoftDeny] = useState<PolicyDeniedError | null>(null);

  const available = availableUsd.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parsedRecipient = tryParseAddress(recipient.trim());
  const amountOk = Number(amount) > 0 && Number(amount) <= availableUsd + 1e-9;
  const canSend = Boolean(parsedRecipient && amountOk && !busy);

  async function pickRecipientNfc() {
    setBusy(true);
    try {
      const id = await identifyAccessory();
      setRecipient(String(id.walletPda));
      toast.success(copy.wallet.accessoryLinked);
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function runSend() {
    if (!parsedRecipient || !amountOk) return;
    setBusy(true);
    setHardError(null);
    setSoftDeny(null);
    setPhase("holding");
    try {
      const { confirmed } = await sendUsdcFromWallet({
        phygitalTokenPda,
        recipient: parsedRecipient,
        amountUi: amount,
      });
      await confirmed;
      setPhase("success");
      toast.success(copy.wallet.sent);
      onSent();
    } catch (e) {
      if (e instanceof PolicyDeniedError) {
        if (e.soft && e.intentHash) {
          setSoftDeny(e);
          setPhase("form");
          return;
        }
        setPhase("form");
        setHardError(toUserErrorMessage(e));
        return;
      }
      setPhase("form");
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function approveOnce() {
    if (!softDeny?.intentHash) return;
    setBusy(true);
    try {
      await createOneTimeGrant(phygitalTokenPda, softDeny.intentHash);
      setSoftDeny(null);
      await runSend();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
      setBusy(false);
    }
  }

  if (phase === "holding" || phase === "success") {
    return (
      <div className="flex flex-1 flex-col">
        <Header onCancel={onClose} />
        <NfcHoldStatus
          size="lg"
          pulsing={phase === "holding"}
          busy={phase === "holding"}
          tone={phase === "success" ? "success" : "default"}
          title={
            phase === "success" ? copy.wallet.sent : copy.wallet.holdToSend
          }
          body={
            phase === "success" ? undefined : copy.verify.holdStillBody
          }
          action={
            phase === "success" ? (
              <Button type="button" size="lg" className="w-full" onClick={onClose}>
                {copy.common.done}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  if (softDeny) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <Header onCancel={() => setSoftDeny(null)} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
          <h2 className="font-(family-name:--font-display) text-2xl font-medium">
            {copy.wallet.approveSendTitle}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {softDenyBody(softDeny)}
          </p>
          <div className="w-full max-w-sm rounded-2xl bg-muted/25 px-4 py-3 text-left">
            <p className="font-(family-name:--font-display) text-lg">
              ${Number(amount).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {copy.wallet.to}{" "}
              {shortAddress(String(parsedRecipient ?? recipient), 6)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={busy}
            onClick={() => void approveOnce()}
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              copy.wallet.approveOnce
            )}
          </Button>
          {onChangeLimits ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={busy}
              onClick={() => onChangeLimits(softDeny.code)}
            >
              {copy.wallet.changeLimits}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Header onCancel={onClose} title={copy.wallet.send} />
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="flex items-baseline gap-1">
          <span className="font-(family-name:--font-display) text-3xl font-light text-muted-foreground">
            $
          </span>
          <Input
            variant="hero"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            aria-label={copy.wallet.send}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {copy.wallet.ofAvailable(available)}
        </p>
        <button
          type="button"
          className="text-xs font-medium text-primary"
          onClick={() => setAmount(availableUsd.toFixed(2))}
        >
          Max
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="px-1 text-xs font-medium text-muted-foreground">
          {copy.wallet.to}
        </label>
        <div className="flex gap-2">
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            placeholder={copy.wallet.pasteAddress}
            className="flex-1 font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={copy.wallet.tapAccessory}
            disabled={busy}
            onClick={() => void pickRecipientNfc()}
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Nfc className="size-4" />
            )}
          </Button>
        </div>
        {parsedRecipient ? (
          <p className="px-1 text-xs text-muted-foreground">
            {shortAddress(String(parsedRecipient), 6)}
          </p>
        ) : null}
      </div>

      {hardError ? (
        <div className="rounded-2xl bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
          <p>{hardError}</p>
          {onChangeLimits ? (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-primary"
              onClick={() => onChangeLimits()}
            >
              {copy.wallet.changeLimits}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canSend}
          onClick={() => void runSend()}
        >
          {copy.wallet.holdToSend}
        </Button>
      </div>
    </div>
  );
}

function Header({
  onCancel,
  title,
}: {
  onCancel: () => void;
  title?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        {copy.common.cancel}
      </Button>
      {title ? (
        <p className="text-sm font-medium">{title}</p>
      ) : (
        <span />
      )}
      <span className="w-16" aria-hidden />
    </div>
  );
}
