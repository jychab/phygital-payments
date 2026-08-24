"use client";

import { useState } from "react";
import { Check, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSendAsset } from "@/hooks/wallet/use-send-asset";
import { tryParseAddress } from "@/lib/solana/address";
import { toUserErrorMessage } from "@/lib/user-errors";
import { shortAddress } from "@/lib/utils";
import { parseUiAmount } from "@/lib/wallet/parse-amount";
import {
  formatTokenAmount,
  type WalletHolding,
} from "@/lib/wallet/portfolio";

export type SendDraft = {
  holding: WalletHolding;
  amount: string;
  destination: string;
};

export function SendConfirmCard({
  draft,
  onCancel,
  onSuccess,
}: {
  draft: SendDraft;
  onCancel: () => void;
  onSuccess: (signature: string) => void;
}) {
  const send = useSendAsset();
  const [destination, setDestination] = useState(draft.destination);
  const [amount, setAmount] = useState(
    draft.holding.kind === "collectible" ? "1" : draft.amount,
  );

  const dest = tryParseAddress(destination.trim());
  const isCollectible = draft.holding.kind === "collectible";
  const parsedAtoms = isCollectible
    ? 1n
    : parseUiAmount(amount, draft.holding.decimals);
  const exceedsBalance =
    !isCollectible &&
    parsedAtoms != null &&
    parsedAtoms > BigInt(draft.holding.balance);
  const busy = send.isPending;
  const error = send.error
    ? toUserErrorMessage(send.error, "That didn’t go through. Try again.")
    : null;
  const canSubmit =
    Boolean(dest) &&
    parsedAtoms != null &&
    parsedAtoms > 0n &&
    !exceedsBalance &&
    !busy;

  function onConfirm() {
    if (!dest || !canSubmit) return;
    send.reset();
    send.mutate(
      {
        holding: draft.holding,
        destination: dest,
        uiAmount: isCollectible ? "1" : amount.trim(),
      },
      { onSuccess: (result) => onSuccess(result.signature) },
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {draft.holding.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={draft.holding.image}
            alt=""
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-medium uppercase text-muted-foreground">
            {draft.holding.symbol.slice(0, 2)}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {draft.holding.name}
          </p>
          <p className="text-xs text-muted-foreground">
            Available {formatTokenAmount(draft.holding.uiAmount)}{" "}
            {draft.holding.symbol}
          </p>
        </div>
      </div>

      {!isCollectible ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="send-amount">Amount</Label>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={busy}
              onClick={() => setAmount(String(draft.holding.uiAmount))}
            >
              Max
            </Button>
          </div>
          <Input
            id="send-amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            disabled={busy}
            aria-invalid={exceedsBalance || undefined}
          />
          {exceedsBalance ? (
            <p className="text-xs text-destructive">Not enough balance</p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="send-to">To</Label>
        <Input
          id="send-to"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Solana address"
          disabled={busy}
          className="font-mono text-xs"
          aria-invalid={
            destination.trim().length > 0 && !dest ? true : undefined
          }
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={!canSubmit}
          onClick={onConfirm}
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Confirm"}
        </Button>
      </div>
    </div>
  );
}

export function SendSuccessLine({
  symbol,
  destination,
}: {
  symbol: string;
  destination: string;
}) {
  return (
    <p className="flex items-center gap-2 text-sm text-foreground">
      <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
      Sent {symbol} to {shortAddress(destination, 4)}
    </p>
  );
}
