"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Settings2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { PayFlowPanel } from "@/components/pay/pay-flow-panel";
import { AllowVerifierPanel } from "@/components/pay/allow-verifier-panel";
import { ManagePayTokens } from "@/components/pay/pay-limit-panel";
import { Button } from "@/components/ui/button";
import { useRevokeDelegateMutation } from "@/hooks/use-delegate-mutations";
import { useDelegateStatuses } from "@/hooks/use-delegate-status";
import { useTokenHoldings } from "@/hooks/use-verified-tokens";
import { useDevicePayKeyHelpers } from "@/lib/payments/device-pay-key-client";
import { hasLocalPayKey } from "@/lib/payments/device-setup-state";
import {
  getDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/payments/payment-token";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { queryKeys } from "@/lib/queries";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

/**
 * Home Pay tab — Enable Pay, Pay $X flow, and settings.
 */
export function PayPanel({
  onEditTokenLimit,
}: {
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
}) {
  const { address: walletAddress } = useSolanaAddress();
  const { provisionKey } = useDevicePayKeyHelpers();
  const queryClient = useQueryClient();
  const [keyBusy, setKeyBusy] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [payFlowKey, setPayFlowKey] = useState(0);

  const hasKey = Boolean(walletAddress && hasLocalPayKey(walletAddress));

  const holdings = useTokenHoldings(walletAddress);
  const mints =
    holdings.data && holdings.data.length > 0
      ? holdings.data.map((h) => h.mint)
      : [String(getDefaultMint())];
  const statuses = useDelegateStatuses(walletAddress, mints);

  const revoke = useRevokeDelegateMutation(walletAddress, {
    mint: getDefaultMint(),
    onSuccess: () => toast.message("USDC Pay turned off"),
  });

  const manageBusy = revoke.isPending || keyBusy;

  function remountPayFlow() {
    setPayFlowKey((n) => n + 1);
  }

  async function onRotateKey() {
    if (!walletAddress) return;
    try {
      setKeyBusy(true);
      await provisionKey(walletAddress, { rotate: true });
      remountPayFlow();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.preauthStatus.byWallet(walletAddress),
      });
      toast.success("Pay reset — update any saved shortcuts");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't reset Pay"));
    } finally {
      setKeyBusy(false);
    }
  }

  async function onTurnOff() {
    try {
      await revoke.mutateAsync();
      setManageOpen(false);
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't turn off Pay"));
    }
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

      <div className="flex flex-col gap-2 border-t border-border/40 pt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setManageOpen((o) => !o)}
          disabled={manageBusy}
        >
          <Settings2 className="size-3.5" />
          Manage Pay
        </Button>
        {manageOpen ? (
          <div
            className={cn(
              "flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/25 p-2",
            )}
          >
            <div className="space-y-1">
              <p className="px-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Enabled tokens
              </p>
              <ManagePayTokens
                owner={walletAddress}
                onEditLimit={onEditTokenLimit}
              />
            </div>
            <p className="flex items-center justify-center gap-1 px-2 text-center text-[11px] text-muted-foreground">
              <Check className="size-3" strokeWidth={2.5} />
              {statuses.enabledMints.length} token
              {statuses.enabledMints.length === 1 ? "" : "s"} enabled
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => void onRotateKey()}
              disabled={manageBusy}
            >
              Reset Pay on This Phone
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground hover:text-destructive"
              onClick={onTurnOff}
              disabled={manageBusy}
            >
              {revoke.isPending ? "Turning off…" : "Turn off USDC Pay"}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
