"use client";

import { useState } from "react";
import { toast } from "sonner";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copy } from "@/lib/copy/phygital";
import { identifyAccessory } from "@/lib/wallet/identify-accessory";
import { receiveUsdcFromPayerToken } from "@/lib/wallet/receive-usdc";
import { shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";

type LinkedPayer = {
  walletPda: string;
  tokenPda: string;
};

type Phase = "form" | "identifying" | "settling" | "success";

/** Receive nearby — identify From (NFC), then Hold to receive. */
export function ReceiveNearbySheet({
  recipientWallet,
  onClose,
  onReceived,
}: {
  recipientWallet: string;
  onClose: () => void;
  onReceived: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState<LinkedPayer | null>(null);
  const [phase, setPhase] = useState<Phase>("form");

  const amountOk = Number(amount) > 0;
  const canSettle = Boolean(from && amountOk);

  async function identifyFrom() {
    setPhase("identifying");
    try {
      const id = await identifyAccessory();
      if (String(id.walletPda) === recipientWallet) {
        throw new Error("You can’t receive from this accessory");
      }
      setFrom({
        walletPda: String(id.walletPda),
        tokenPda: String(id.token.address),
      });
      toast.success(copy.wallet.accessoryLinked);
      setPhase("form");
    } catch (e) {
      setPhase("form");
      toast.error(toUserErrorMessage(e));
    }
  }

  async function holdToReceive() {
    if (!from || !amountOk) return;
    setPhase("settling");
    try {
      const { confirmed } = await receiveUsdcFromPayerToken({
        payerPhygitalTokenPda: from.tokenPda,
        expectedPayerWallet: from.walletPda,
        recipientWallet,
        amountUi: amount,
      });
      await confirmed;
      setPhase("success");
      toast.success(copy.wallet.received);
      onReceived();
    } catch (e) {
      setPhase("form");
      toast.error(toUserErrorMessage(e));
    }
  }

  if (phase === "identifying" || phase === "settling" || phase === "success") {
    const settling = phase === "settling";
    const success = phase === "success";
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {copy.common.cancel}
          </Button>
          <span className="w-16" aria-hidden />
        </div>
        <NfcHoldStatus
          size="lg"
          pulsing={!success}
          busy={!success}
          tone={success ? "success" : "default"}
          title={
            success
              ? copy.wallet.received
              : settling
                ? copy.wallet.holdToReceive
                : copy.wallet.tapTheirAccessory
          }
          body={success ? undefined : copy.verify.holdStillBody}
          action={
            success ? (
              <Button type="button" size="lg" className="w-full" onClick={onClose}>
                {copy.common.done}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {copy.common.cancel}
        </Button>
        <p className="text-sm font-medium">{copy.wallet.receiveNearby}</p>
        <span className="w-16" aria-hidden />
      </div>

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
            aria-label={copy.wallet.receive}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="px-1 text-xs font-medium text-muted-foreground">
          {copy.wallet.from}
        </label>
        {from ? (
          <div className="flex items-center justify-between rounded-2xl bg-muted/25 px-4 py-3">
            <p className="text-sm tabular-nums">
              {shortAddress(from.walletPda, 6)}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setFrom(null)}
            >
              {copy.wallet.clear}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-12 justify-start"
            onClick={() => void identifyFrom()}
          >
            {copy.wallet.tapTheirAccessory}
          </Button>
        )}
      </div>

      <div className="mt-auto">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canSettle}
          onClick={() => void holdToReceive()}
        >
          {copy.wallet.holdToReceive}
        </Button>
      </div>
    </div>
  );
}
