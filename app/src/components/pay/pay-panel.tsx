"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronLeft, Settings2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { PayFlowPanel } from "@/components/pay/pay-flow-panel";
import { AllowVerifierPanel } from "@/components/pay/allow-verifier-panel";
import { ManagePayTokens } from "@/components/pay/pay-limit-panel";
import { Button } from "@/components/ui/button";
import { useDelegateStatus, useDelegateStatuses } from "@/hooks/use-delegate-status";
import { useTokenHoldings } from "@/hooks/use-verified-tokens";
import { useDevicePayKeyHelpers } from "@/lib/payments/device-pay-key-client";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";
import { hasLocalPayKey } from "@/lib/payments/device-setup-state";
import {
  defaultTapAmountUi,
  getDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/payments/payment-token";
import { copyPayShortcutLink } from "@/lib/payments/presence-grant-client";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { queryKeys } from "@/lib/queries";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

/**
 * Home Pay tab — Enable Pay, Pay $X flow, and settings.
 */
export function PayPanel({
  onManage,
}: {
  onManage: () => void;
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
}: {
  owner: string;
  onBack: () => void;
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
}) {
  const { provisionKey } = useDevicePayKeyHelpers();
  const queryClient = useQueryClient();
  const [keyBusy, setKeyBusy] = useState(false);

  const holdings = useTokenHoldings(owner);
  const mints =
    holdings.data && holdings.data.length > 0
      ? holdings.data.map((h) => h.mint)
      : [String(getDefaultMint())];
  const statuses = useDelegateStatuses(owner, mints);
  const capQuery = useDelegateStatus(owner, getDefaultMint());
  const limitUi = isDelegateEnabled(capQuery.data)
    ? capQuery.data?.delegatedAmountUi
    : null;

  async function onRotateKey() {
    try {
      setKeyBusy(true);
      await provisionKey(owner, { rotate: true });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.preauthStatus.byWallet(owner),
      });
      toast.success("API key rotated — update any saved shortcuts");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't rotate API key"));
    } finally {
      setKeyBusy(false);
    }
  }

  async function onAddToShortcuts() {
    try {
      setKeyBusy(true);
      await copyPayShortcutLink({
        wallet: owner,
        amountUi: defaultTapAmountUi(limitUi),
        mint: String(getDefaultMint()),
      });
      toast.success("Shortcut link copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't copy link"));
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
          Spending limits, Shortcuts, and this phone&apos;s Pay key.
        </p>
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
          Rotate API Key
        </Button>
      </div>
    </div>
  );
}
