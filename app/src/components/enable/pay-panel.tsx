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

import { AmountField } from "@/components/amount-field";
import { AmountPresets } from "@/components/amount-presets";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { useDelegateStatus } from "@/hooks/use-delegate-status";
import { useMintProgram } from "@/hooks/use-mint-program";
import { useRevokeAllowanceMutation } from "@/hooks/use-allowance-mutations";
import { uiAmountToRaw } from "@/lib/payments/usdc-allowance";
import {
  buildPreauthOpenUrl,
  cancelPreauth,
  loadPreauthApiKey,
  requestPreauth,
} from "@/lib/payments/preauth-client";
import { useDevicePayKeyHelpers } from "@/lib/payments/provision-client";
import { getUsdcMint } from "@/lib/payments/usdc";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

const PRESETS = ["10", "20", "50"] as const;

type Phase = "idle" | "window" | "expired";

/**
 * Everyday Pay: open a short spending window (same GET as Shortcuts),
 * then hold NFC to the merchant. No paid/receipt polling — merchant Collect
 * is the source of truth for settlement.
 */
export function PayPanel({ onChangeLimit }: { onChangeLimit?: () => void }) {
  const { address: walletAddress } = useSolanaAddress();
  const { ensureKey } = useDevicePayKeyHelpers();
  const [amount, setAmount] = useState("20");
  const [busy, setBusy] = useState(false);
  const [keyBusy, setKeyBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [hasKey, setHasKey] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    setHasKey(Boolean(walletAddress && loadPreauthApiKey(walletAddress)));
  }, [walletAddress]);

  const usdcMint = getUsdcMint();
  const statusQuery = useDelegateStatus(walletAddress);
  const mintQuery = useMintProgram(usdcMint);
  const status = statusQuery.data;
  const revoke = useRevokeAllowanceMutation(walletAddress, {
    onSuccess: () => toast.message("Pay turned off"),
  });

  const limitLabel = status?.delegatedAmountUi ?? "—";
  const windowOpen = phase === "window";
  const manageBusy = busy || revoke.isPending || keyBusy;
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

  async function onReady() {
    if (!walletAddress) {
      toast.error("Sign in to continue");
      return;
    }
    if (!mintQuery.data) {
      toast.error("Still loading — try again in a moment");
      return;
    }
    try {
      setBusy(true);
      if (!loadPreauthApiKey(walletAddress)) {
        await ensureKey(walletAddress);
        setHasKey(true);
      }
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      if (
        status?.delegatedAmountRaw != null &&
        rawAmount > status.delegatedAmountRaw
      ) {
        toast.error(`Amount exceeds your ${limitLabel} USDC limit`);
        return;
      }
      const grant = await requestPreauth({
        wallet: walletAddress,
        amountUi: amount,
        mint: usdcMint,
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
      onChangeLimit?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t turn off Pay"));
    }
  }

  async function onCopyApiKey() {
    if (!walletAddress) {
      toast.error("Sign in to continue");
      return;
    }
    try {
      setKeyBusy(true);
      let key = loadPreauthApiKey(walletAddress);
      if (!key) {
        key = await ensureKey(walletAddress);
        setHasKey(true);
      }
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
      toast.error("Sign in to continue");
      return;
    }
    try {
      setKeyBusy(true);
      let key = loadPreauthApiKey(walletAddress);
      if (!key) {
        key = await ensureKey(walletAddress);
        setHasKey(true);
      }
      const url = buildPreauthOpenUrl({
        apiKey: key,
        amountUi: amount || "20",
        mint: usdcMint,
      });
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
      toast.error("Sign in to continue");
      return;
    }
    try {
      setKeyBusy(true);
      await ensureKey(walletAddress, { rotate: true });
      setHasKey(true);
      toast.success("New API key ready — update any Shortcuts");
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
          className="h-11 w-full max-w-xs text-[0.9375rem]"
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
        body={`Paying up to ${amount} USDC · ${secondsLeft}s left`}
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
        <p className="text-sm font-medium text-foreground">This payment</p>
        <p className="text-xs text-muted-foreground">
          Choose how much, then hold your NFC device to their phone.
        </p>
      </div>

      <AmountField
        id="pay-amount"
        value={amount}
        onChange={setAmount}
        disabled={manageBusy}
      />

      <AmountPresets
        value={amount}
        onChange={setAmount}
        presets={PRESETS}
        disabled={manageBusy}
      />

      <p className="text-center text-[11px] text-muted-foreground">
        Up to {limitLabel} USDC
        <span className="text-muted-foreground/50"> · </span>
        <span className="inline-flex items-center gap-1 text-primary/90">
          <Check className="size-3" strokeWidth={2.5} />
          Ready
        </span>
      </p>

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="h-11 w-full text-[0.9375rem]"
          onClick={onReady}
          disabled={manageBusy || !amount}
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
              "flex flex-col gap-1 rounded-xl border border-border/50 bg-muted/25 p-2",
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => {
                setManageOpen(false);
                onChangeLimit?.();
              }}
              disabled={manageBusy}
            >
              Change limit
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => void onCopyApiKey()}
              disabled={manageBusy}
            >
              {keyBusy ? "Working…" : "Copy API key"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => void onCopyOpenUrl()}
              disabled={manageBusy}
            >
              Copy open URL
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground"
              onClick={() => void onRotateKey()}
              disabled={manageBusy}
            >
              Rotate API key
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-muted-foreground hover:text-destructive"
              onClick={onTurnOff}
              disabled={manageBusy}
            >
              {revoke.isPending ? "Turning off…" : "Turn off Pay"}
            </Button>
          </div>
        ) : null}
        {!hasKey ? (
          <p className="text-center text-[11px] text-muted-foreground/70">
            First time on this phone may ask you to confirm once.
          </p>
        ) : null}
      </div>
    </div>
  );
}
