"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft } from "lucide-react";

import { AmountField } from "@/components/amount-field";
import { AmountPresets } from "@/components/amount-presets";
import { TokenSymbol } from "@/components/token-chip";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { useMaxTapAmountUi } from "@/hooks/use-max-tap-amount";
import { useMintProgram } from "@/hooks/use-mint-program";
import { isDelegateEnabled, uiAmountToRaw } from "@/lib/payments/mint-delegate";
import {
  hasStoredMaxTapAmount,
  parseMaxTapAmountUi,
  storeMaxTapAmountUi,
} from "@/lib/payments/max-tap-store";
import {
  PAY_AMOUNT_PRESETS,
  defaultTapAmountUi,
  defaultUsdcToken,
  getDefaultMint,
} from "@/lib/payments/payment-token";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/**
 * Pick a max tap amount for this phone (localStorage; no wallet signature).
 */
export function MaxTapPanel({
  owner,
  onSaved,
  onBack,
}: {
  owner: string;
  onSaved?: () => void;
  onBack?: () => void;
}) {
  const { address: walletAddress, isConnected } = useSolanaAddress();
  const stored = useMaxTapAmountUi(owner);
  const [amount, setAmount] = useState(stored);
  const [saving, setSaving] = useState(false);

  const mint = getDefaultMint();
  const capQuery = useDelegateStatus(owner, mint);
  const mintQuery = useMintProgram(mint);
  const token = defaultUsdcToken();
  const tokenEnabled = isDelegateEnabled(capQuery.data);
  const limitUi = tokenEnabled ? capQuery.data?.delegatedAmountUi : null;
  const decimals = mintQuery.data?.decimals ?? token.decimals;

  useEffect(() => {
    if (!limitUi) return;
    setAmount((current) => defaultTapAmountUi(limitUi, current));
  }, [limitUi]);

  const hasStored = hasStoredMaxTapAmount(owner);
  const wrongWallet =
    isConnected && walletAddress != null && walletAddress !== owner;
  const matched = isConnected && walletAddress === owner;

  const parsed = parseMaxTapAmountUi(amount);
  let overLimit = false;
  if (parsed && limitUi != null && mintQuery.data) {
    try {
      const raw = uiAmountToRaw(parsed, decimals);
      overLimit =
        capQuery.data?.delegatedAmountRaw != null &&
        raw > capQuery.data.delegatedAmountRaw;
    } catch {
      overLimit = false;
    }
  }

  function onSave() {
    if (!matched) return;
    if (!parsed) {
      toast.error("Enter a valid amount");
      return;
    }
    if (overLimit) {
      toast.error(`Can't be more than your $${limitUi} spending limit.`);
      return;
    }
    try {
      uiAmountToRaw(parsed, decimals);
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Enter a valid amount"));
      return;
    }
    try {
      setSaving(true);
      storeMaxTapAmountUi(owner, parsed);
      toast.success("Max tap amount saved. Update any saved Shortcuts.");
      onSaved?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t save max tap amount"));
    } finally {
      setSaving(false);
    }
  }

  const cta = hasStored ? "Update Amount" : "Set Amount";

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
          Back
        </button>
      ) : null}

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Set Max Tap Amount
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Each payment from this phone can be up to this much{" "}
          <TokenSymbol
            token={token}
            size="xs"
            className="mx-0.5"
            symbolClassName="font-medium text-foreground"
          />
          . You can change it anytime.
        </p>
      </div>

      <AmountField
        id="max-tap-amount"
        value={amount}
        onChange={setAmount}
        token={token}
        decimals={decimals}
        disabled={saving || !matched}
        autoFocus={matched}
      />

      <AmountPresets
        value={amount}
        onChange={setAmount}
        presets={PAY_AMOUNT_PRESETS}
        disabled={saving || !matched}
      />

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] tabular-nums text-muted-foreground">
        From {shortAddress(owner, 4)}
        {limitUi ? (
          <>
            <span>·</span>
            <span>Limit ${limitUi}</span>
          </>
        ) : null}
      </p>
      {overLimit ? (
        <p className="text-center text-[11px] text-destructive">
          Over your ${limitUi} spending limit
        </p>
      ) : null}
      {!isConnected ? (
        <p className="rounded-xl border border-border/60 bg-muted/25 px-3 py-2 text-center text-xs text-muted-foreground">
          Connect {shortAddress(owner, 4)} above to continue.
        </p>
      ) : wrongWallet ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          Wrong wallet. Disconnect above, then connect{" "}
          {shortAddress(owner, 4)}.
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={onSave}
          disabled={saving || !parsed || !matched || overLimit}
        >
          {hasStored && matched ? (
            <>
              <Check className="size-4" />
              {cta}
            </>
          ) : (
            cta
          )}
        </Button>
      </div>
    </div>
  );
}
