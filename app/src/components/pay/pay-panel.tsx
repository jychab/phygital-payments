"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  LoaderCircle,
  Nfc,
  Settings2,
  X,
} from "lucide-react";

import { ManagePayTokens } from "@/components/pay/pay-limit-panel";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { TokenSymbol } from "@/components/token-chip";
import { Button } from "@/components/ui/button";
import { useRevokeDelegateMutation } from "@/hooks/use-delegate-mutations";
import { useDelegateStatuses } from "@/hooks/use-delegate-status";
import { useTokenHoldings } from "@/hooks/use-verified-tokens";
import {
  buildPreauthOpenUrl,
  cancelPreauth,
  loadPreauthApiKey,
  requestPreauth,
} from "@/lib/payments/presence-grant-client";
import { useDevicePayKeyHelpers } from "@/lib/payments/device-pay-key-client";
import {
  defaultUsdcToken,
  getDefaultMint,
} from "@/lib/payments/payment-token";
import type { PaymentTokenHolding } from "@/lib/payments/payment-token";
import { isDelegateEnabled } from "@/lib/payments/mint-delegate";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

type Phase = "idle" | "window" | "expired";

/**
 * Everyday Pay: open a presence window, then hold NFC to the merchant.
 * Mint and amount come from Collect; on-chain delegates are the spend caps.
 */
export function PayPanel({
  onEditTokenLimit,
}: {
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
}) {
  const { address: walletAddress } = useSolanaAddress();
  const { provisionKey } = useDevicePayKeyHelpers();
  const [busy, setBusy] = useState(false);
  const [keyBusy, setKeyBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [manageOpen, setManageOpen] = useState(false);
  const [keyEpoch, setKeyEpoch] = useState(0);
  // Re-read localStorage after provision / rotate (keyEpoch bump).
  void keyEpoch;
  const hasKey = Boolean(walletAddress && loadPreauthApiKey(walletAddress));

  const defaultMint = getDefaultMint();
  const holdings = useTokenHoldings(walletAddress);
  const mints =
    holdings.data && holdings.data.length > 0
      ? holdings.data.map((h) => h.mint)
      : [String(defaultMint)];
  const statuses = useDelegateStatuses(walletAddress, mints);
  const usdcStatus = statuses.data?.get(String(defaultMint));
  const enabledMintCount = statuses.enabledMints.length;
  const usdcLimitLabel = isDelegateEnabled(usdcStatus)
    ? usdcStatus?.delegatedAmountUi
    : null;

  const revoke = useRevokeDelegateMutation(walletAddress, {
    mint: defaultMint,
    onSuccess: () => toast.message("USDC Pay turned off"),
  });

  const windowOpen = phase === "window";
  const manageBusy = busy || revoke.isPending || keyBusy;
  const usdcToken = defaultUsdcToken();
  const secondsLeft =
    expiresAt != null && expiresAt * 1000 > nowMs
      ? Math.max(0, Math.ceil((expiresAt * 1000 - nowMs) / 1000))
      : 0;

  useEffect(() => {
    if (!windowOpen || expiresAt == null) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNowMs(t);
      if (expiresAt * 1000 <= t) {
        setPhase("expired");
        setExpiresAt(null);
      }
    }, 500);
    return () => window.clearInterval(id);
  }, [windowOpen, expiresAt]);

  function noteKeyReady() {
    setKeyEpoch((n) => n + 1);
  }

  async function onEnablePhone() {
    if (!walletAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      setKeyBusy(true);
      await provisionKey(walletAddress);
      noteKeyReady();
      toast.success("Payment verifier ready");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t set up payment verifier"));
    } finally {
      setKeyBusy(false);
    }
  }

  async function onReady() {
    if (!walletAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!loadPreauthApiKey(walletAddress)) {
      toast.error("Set up a payment verifier first");
      return;
    }
    try {
      setBusy(true);
      const grant = await requestPreauth({
        wallet: walletAddress,
      });
      setNowMs(Date.now());
      setExpiresAt(grant.expiresAt);
      setPhase("window");
      toast.success("Ready — hold your NFC device to their phone");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t get ready to pay"));
    } finally {
      setBusy(false);
    }
  }

  async function onCancelWindow() {
    setPhase("expired");
    setExpiresAt(null);
    try {
      await cancelPreauth({ wallet: walletAddress ?? undefined });
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t cancel"));
    }
  }

  async function onTurnOff() {
    try {
      await revoke.mutateAsync();
      setManageOpen(false);
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t turn off Pay"));
    }
  }

  async function onCopyApiKey() {
    if (!walletAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    const key = loadPreauthApiKey(walletAddress);
    if (!key) {
      toast.error("Set up a payment verifier first");
      return;
    }
    try {
      setKeyBusy(true);
      await navigator.clipboard.writeText(key);
      toast.success("API key copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t copy API key"));
    } finally {
      setKeyBusy(false);
    }
  }

  async function onCopyOpenUrl() {
    if (!walletAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    const key = loadPreauthApiKey(walletAddress);
    if (!key) {
      toast.error("Set up a payment verifier first");
      return;
    }
    try {
      setKeyBusy(true);
      const url = buildPreauthOpenUrl({ apiKey: key });
      await navigator.clipboard.writeText(url);
      toast.success("Open URL copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t copy open URL"));
    } finally {
      setKeyBusy(false);
    }
  }

  async function onRotateKey() {
    if (!walletAddress) {
      toast.error("Connect your wallet first");
      return;
    }
    try {
      setKeyBusy(true);
      await provisionKey(walletAddress, { rotate: true });
      noteKeyReady();
      toast.success("Api key rotated — update any Shortcuts");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t rotate API key"));
    } finally {
      setKeyBusy(false);
    }
  }

  if (phase === "expired") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 py-10 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-border/60 bg-muted/40 text-muted-foreground">
          <X className="size-6" strokeWidth={2} />
        </div>
        <div className="max-w-60 space-y-1.5">
          <p className="text-base font-medium text-foreground">
            Window ended
          </p>
          <p className="text-sm text-muted-foreground">
            If you already held your NFC device to their phone, check with them.
            Otherwise open a new window to try again.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full max-w-xs"
          onClick={() => setPhase("idle")}
        >
          Done
        </Button>
      </div>
    );
  }

  if (windowOpen) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Hold NFC device to their phone"
        body={`Ready to pay · ${secondsLeft}s left`}
        pulsing
        action={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void onCancelWindow()}
          >
            Cancel
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="space-y-1 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Pay
        </p>
        {hasKey ? (
          <>
            <p className="text-sm font-medium text-foreground">Ready to pay</p>
            <p className="text-xs text-muted-foreground">
              Open a short window, then hold your NFC device to their phone. They
              choose the token and amount.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Set Up Payment Verifier
            </p>
            <p className="text-xs text-muted-foreground">
              Your wallet will ask you to sign a message to set up a payment
              verifier on this phone. That is not a transaction and does not
              move funds.
            </p>
          </>
        )}
      </div>

      <p className="flex flex-wrap items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
        {usdcLimitLabel != null ? (
          <>
            <TokenSymbol token={usdcToken} size="xs" />
            <span>limit {usdcLimitLabel}</span>
          </>
        ) : (
          <span>
            {enabledMintCount} token
            {enabledMintCount === 1 ? "" : "s"} enabled
          </span>
        )}
        <span className="text-muted-foreground/50">·</span>
        {hasKey ? (
          <span className="inline-flex items-center gap-1 text-primary/90">
            <Check className="size-3" strokeWidth={2.5} />
            Ready
          </span>
        ) : (
          <span>Needs a payment verifier</span>
        )}
      </p>

      <div className="mt-auto flex flex-col gap-2.5">
        {hasKey ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onReady}
            disabled={manageBusy}
          >
            {busy ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Getting ready…
              </>
            ) : (
              <>
                <Nfc className="size-4" />
                Ready to pay
              </>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void onEnablePhone()}
            disabled={manageBusy}
          >
            {keyBusy ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Sign in your wallet…
              </>
            ) : (
              "Set Up Payment Verifier"
            )}
          </Button>
        )}
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
            {walletAddress ? (
              <div className="space-y-1">
                <p className="px-2 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Enabled tokens
                </p>
                <ManagePayTokens
                  owner={walletAddress}
                  onEditLimit={onEditTokenLimit}
                />
              </div>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => void onCopyApiKey()}
              disabled={manageBusy || !hasKey}
            >
              {keyBusy ? "Working…" : "Copy API key"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => void onCopyOpenUrl()}
              disabled={manageBusy || !hasKey}
            >
              Copy open URL
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => void onRotateKey()}
              disabled={manageBusy || !hasKey}
            >
              Rotate Api Key
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
