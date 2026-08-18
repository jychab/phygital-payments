"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, Settings2 } from "lucide-react";

import { PayFlowPanel } from "@/components/pay/pay-flow-panel";
import { AllowVerifierPanel } from "@/components/pay/allow-verifier-panel";
import { ManagePayTokens } from "@/components/pay/pay-limit-panel";
import { TokenIcon } from "@/components/token-chip";
import { Button } from "@/components/ui/button";
import { useDelegateStatus, useDelegateStatuses } from "@/hooks/use-delegate-status";
import { useMaxTapAmountUi } from "@/hooks/use-max-tap-amount";
import { usePayTokenContext } from "@/hooks/use-verified-tokens";
import { useDevicePayKeyHelpers } from "@/lib/payments/device-pay-key-client";
import { isDelegateEnabled, uiAmountToRaw } from "@/lib/payments/mint-delegate";
import { hasLocalPayKey } from "@/lib/payments/device-setup-state";
import {
  defaultTapAmountUi,
  defaultUsdcToken,
  getDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/payments/payment-token";
import { copyPayShortcutLink } from "@/lib/payments/preauth-client";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

/**
 * Home Pay tab — Enable Pay, Pay $X flow, and settings.
 */
export function PayPanel({
  onManage,
  onSetLimit,
}: {
  onManage: () => void;
  onSetLimit?: () => void;
}) {
  const { address: walletAddress } = useSolanaAddress();
  const [payFlowKey, setPayFlowKey] = useState(0);

  const hasKey = Boolean(walletAddress && hasLocalPayKey(walletAddress));

  function remountPayFlow() {
    setPayFlowKey((n) => n + 1);
  }

  if (!walletAddress) {
    return null;
  }

  if (!hasKey) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <AllowVerifierPanel
          expectedOwner={walletAddress}
          onAllowed={() => remountPayFlow()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <PayFlowPanel
        key={payFlowKey}
        owner={walletAddress}
        variant="home"
        assumeKeyReady
        onSetLimit={onSetLimit}
      />

      <div className="mt-auto border-t border-border/40 pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={onManage}
        >
          <Settings2 className="size-3.5" />
          Manage Pay
        </Button>
      </div>
    </div>
  );
}

export function ManagePayPanel({
  owner,
  onBack,
  onEditTokenLimit,
  onEditMaxTap,
}: {
  owner: string;
  onBack: () => void;
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
  onEditMaxTap: () => void;
}) {
  const { provisionKey } = useDevicePayKeyHelpers();
  const [keyBusy, setKeyBusy] = useState(false);

  const payContext = usePayTokenContext(owner);
  const mints =
    payContext.data?.holdings && payContext.data.holdings.length > 0
      ? payContext.data.holdings.map((h) => h.mint)
      : [String(getDefaultMint())];
  const statuses = useDelegateStatuses(owner, mints);
  const capQuery = useDelegateStatus(owner, getDefaultMint());
  const limitUi = isDelegateEnabled(capQuery.data)
    ? capQuery.data?.delegatedAmountUi
    : null;
  const maxTapUi = useMaxTapAmountUi(owner);
  const tapCapUi = defaultTapAmountUi(limitUi, maxTapUi);
  const usdc = defaultUsdcToken();

  async function onRotateKey() {
    try {
      setKeyBusy(true);
      await provisionKey(owner, { rotate: true });
      toast.success("Pay key updated. Update any saved Shortcuts.");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t update Pay key"));
    } finally {
      setKeyBusy(false);
    }
  }

  async function onAddToShortcuts() {
    try {
      setKeyBusy(true);
      await copyPayShortcutLink({
        wallet: owner,
        amount: uiAmountToRaw(
          defaultTapAmountUi(limitUi, maxTapUi),
          usdc.decimals,
        ).toString(),
        mint: String(getDefaultMint()),
      });
      toast.success("Shortcut link copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t copy link"));
    } finally {
      setKeyBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 self-start text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-3.5" />
        Back
      </button>

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Manage Pay
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Spending limits, max tap amount, Shortcuts, and this phone’s Pay key.
        </p>
      </div>

      <div className="space-y-1">
        <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          This phone
        </p>
        <button
          type="button"
          onClick={onEditMaxTap}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
        >
          <TokenIcon token={usdc} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              Max tap amount
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              ${tapCapUi}
              {limitUi ? ` · Limit $${limitUi}` : ""}
            </p>
          </div>
          <span className="text-[11px] font-medium text-primary">Edit</span>
        </button>
      </div>

      <div className="space-y-1">
        <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Enabled tokens
        </p>
        <ManagePayTokens owner={owner} onEditLimit={onEditTokenLimit} />
      </div>
      <p className="flex items-center justify-center gap-1 px-2 text-center text-[11px] text-muted-foreground">
        <Check className="size-3" strokeWidth={2.5} />
        {statuses.enabledMints.length} token
        {statuses.enabledMints.length === 1 ? "" : "s"} enabled
      </p>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => void onAddToShortcuts()}
          disabled={keyBusy}
        >
          Add to Shortcuts
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full text-muted-foreground"
          onClick={() => void onRotateKey()}
          disabled={keyBusy}
        >
          Rotate Pay Key
        </Button>
      </div>
    </div>
  );
}
