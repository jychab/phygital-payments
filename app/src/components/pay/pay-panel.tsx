"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, LoaderCircle, Settings2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { CenteredStatus } from "@/components/layout/gate-message";
import { EnablePayPanel } from "@/components/pay/enable-pay-panel";
import { ManagePayTokens } from "@/components/pay/pay-limit-panel";
import { PayFlowPanel } from "@/components/pay/pay-flow-panel";
import { RevealApiKeyPanel } from "@/components/pay/reveal-api-key-panel";
import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { useDelegateStatuses } from "@/hooks/pay/use-delegate-status";
import {
  useVerifiedApiKey,
  markApiKeyVerified,
} from "@/hooks/pay/use-verified-api-key";
import { usePayTokenContext } from "@/hooks/tokens/use-verified-tokens";
import { useProvisionApiKey } from "@/hooks/pay/use-provision-api-key";
import {
  getDefaultMint,
  type PaymentTokenHolding,
} from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

/**
 * Home Pay tab — Enable Pay, Pay, and settings.
 */
export function PayPanel({
  onManage,
  onSetLimit,
}: {
  onManage: () => void;
  onSetLimit?: () => void;
}) {
  const { address: walletAddress } = useSolanaAddress();
  const queryClient = useQueryClient();
  const keyQuery = useVerifiedApiKey(walletAddress ?? null);

  if (!walletAddress) {
    return null;
  }

  if (keyQuery.isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </CenteredStatus>
    );
  }

  if (keyQuery.data !== true) {
    return (
      <EnablePayPanel
        expectedOwner={walletAddress}
        onEnabled={() => markApiKeyVerified(queryClient, walletAddress)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-2.5">
      <PayFlowPanel
        owner={walletAddress}
        variant="home"
        onSetLimit={onSetLimit}
      />
      <Button
        type="button"
        variant="ghost"
        size="lg"
        className="w-full text-muted-foreground"
        onClick={onManage}
      >
        Manage Pay
      </Button>
    </div>
  );
}

/** Home Pay → Settings: API key, extra tokens, spending limits. */
export function ManagePayPanel({
  owner,
  onBack,
  onEditTokenLimit,
}: {
  owner: string;
  onBack: () => void;
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
}) {
  const { provisionKey } = useProvisionApiKey();
  const queryClient = useQueryClient();
  const [keyBusy, setKeyBusy] = useState(false);
  const [reveal, setReveal] = useState(false);

  const payContext = usePayTokenContext(owner);
  const mints =
    payContext.data?.holdings && payContext.data.holdings.length > 0
      ? payContext.data.holdings.map((h) => h.mint)
      : [String(getDefaultMint())];
  const statuses = useDelegateStatuses(owner, mints);

  async function onRotateKey() {
    try {
      setKeyBusy(true);
      await provisionKey(owner, { rotate: true });
      markApiKeyVerified(queryClient, owner);
      toast.success("API key updated");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t update API key"));
    } finally {
      setKeyBusy(false);
    }
  }

  if (reveal) {
    return (
      <RevealApiKeyPanel
        owner={owner}
        onBack={() => setReveal(false)}
        extraAction={{ label: "Rotate API key", onClick: onRotateKey }}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <BackLink onClick={onBack} />

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Manage Pay
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Spending limits and this phone’s API key.
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
          onClick={() => setReveal(true)}
          disabled={keyBusy}
        >
          Manage API Key
        </Button>
      </div>
    </div>
  );
}
