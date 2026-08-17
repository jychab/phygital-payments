"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, LoaderCircle, Nfc, Settings2, X } from "lucide-react";
import { address } from "@solana/kit";
import { useQueryClient } from "@tanstack/react-query";

import { AmountField } from "@/components/amount-field";
import { AmountPresets } from "@/components/amount-presets";
import { ManagePayTokens } from "@/components/pay/pay-limit-panel";
import { NfcHoldStatus } from "@/components/nfc-hold-status";
import { TokenChip, TokenListRow, TokenSymbol } from "@/components/token-chip";
import { Button } from "@/components/ui/button";
import { useRevokeDelegateMutation } from "@/hooks/use-delegate-mutations";
import { useDelegateStatuses } from "@/hooks/use-delegate-status";
import { useMintProgram } from "@/hooks/use-mint-program";
import {
  useTokenHoldings,
  useVerifiedTokens,
} from "@/hooks/use-verified-tokens";
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
  isDefaultMint,
  resolvePaymentToken,
} from "@/lib/payments/payment-token";
import type { PaymentTokenHolding } from "@/lib/payments/payment-token";
import { isDelegateEnabled, uiAmountToRaw } from "@/lib/payments/mint-delegate";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { queryKeys } from "@/lib/queries";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { cn } from "@/lib/utils";

const PRESETS = ["20", "50", "100"] as const;
const DEFAULT_USDC_TAP_AMOUNT = "100";

function defaultTapAmountUi(mint: string): string {
  return isDefaultMint(mint) ? DEFAULT_USDC_TAP_AMOUNT : "";
}

type Phase = "idle" | "window" | "expired";

/**
 * Everyday Pay: pick mint + max tap amount, open a presence window, then hold
 * NFC to the merchant. Collect must match mint and stay at or below the max.
 * On-chain delegates are a second cap.
 */
export function PayPanel({
  onEditTokenLimit,
}: {
  onEditTokenLimit: (holding: PaymentTokenHolding) => void;
}) {
  const { address: walletAddress } = useSolanaAddress();
  const { provisionKey } = useDevicePayKeyHelpers();
  const queryClient = useQueryClient();
  const [amountDraft, setAmountDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [keyBusy, setKeyBusy] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [manageOpen, setManageOpen] = useState(false);
  const [mintPickerOpen, setMintPickerOpen] = useState(false);
  const [keyEpoch, setKeyEpoch] = useState(0);
  // Re-read localStorage after provision / rotate (keyEpoch bump).
  void keyEpoch;
  const hasKey = Boolean(walletAddress && loadPreauthApiKey(walletAddress));

  const defaultMint = String(getDefaultMint());
  const [mintOverride, setMintOverride] = useState<string | null>(null);
  const holdings = useTokenHoldings(walletAddress);
  const verified = useVerifiedTokens();
  const mints =
    holdings.data && holdings.data.length > 0
      ? holdings.data.map((h) => h.mint)
      : [defaultMint];
  const statuses = useDelegateStatuses(walletAddress, mints);
  const mint =
    mintOverride && statuses.enabledMints.includes(mintOverride)
      ? mintOverride
      : statuses.enabledMints.includes(defaultMint)
      ? defaultMint
      : statuses.enabledMints[0] ?? defaultMint;
  const mintAddress = useMemo(() => address(mint), [mint]);
  const mintQuery = useMintProgram(mintAddress);
  const selectedStatus = statuses.data?.get(mint);
  const enabledMintCount = statuses.enabledMints.length;
  const usdcStatus = statuses.data?.get(defaultMint);
  const usdcLimitLabel = isDelegateEnabled(usdcStatus)
    ? usdcStatus?.delegatedAmountUi
    : null;

  const holding = holdings.data?.find(
    (h: PaymentTokenHolding) => h.mint === mint,
  );
  const token = holding ?? resolvePaymentToken(mint, verified.data);
  const enabledHoldings = (holdings.data ?? []).filter((h) =>
    statuses.enabledMints.includes(h.mint),
  );
  const canPickMint = enabledHoldings.length > 1;
  const selectedLimitLabel = isDelegateEnabled(selectedStatus)
    ? selectedStatus?.delegatedAmountUi
    : null;
  const amount = amountDraft ?? defaultTapAmountUi(mint);

  const revoke = useRevokeDelegateMutation(walletAddress, {
    mint: getDefaultMint(),
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
      await queryClient.invalidateQueries({
        queryKey: queryKeys.preauthStatus.byWallet(walletAddress),
      });
      toast.success("Payment verifier enabled for this wallet");
    } catch (error) {
      toast.error(
        toUserErrorMessage(error, "Couldn’t allow the payment verifier"),
      );
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
      toast.error("Allow the payment verifier for this wallet first");
      return;
    }
    if (!mintQuery.data) {
      toast.error("Still loading — try again in a moment");
      return;
    }
    try {
      setBusy(true);
      const rawAmount = uiAmountToRaw(amount, mintQuery.data.decimals);
      if (
        selectedStatus?.delegatedAmountRaw != null &&
        rawAmount > selectedStatus.delegatedAmountRaw
      ) {
        toast.error(
          `Amount exceeds your ${selectedLimitLabel ?? "—"} ${
            token.symbol
          } limit`,
        );
        return;
      }
      const grant = await requestPreauth({
        wallet: walletAddress,
        amountUi: amount,
        mint,
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
      toast.error("Allow the payment verifier for this wallet first");
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
      toast.error("Allow the payment verifier for this wallet first");
      return;
    }
    const amountUi = amount || defaultTapAmountUi(mint);
    if (!amountUi) {
      toast.error("Enter a max tap amount");
      return;
    }
    try {
      setKeyBusy(true);
      const url = buildPreauthOpenUrl({
        apiKey: key,
        amountUi,
        mint,
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
      toast.error("Connect your wallet first");
      return;
    }
    try {
      setKeyBusy(true);
      await provisionKey(walletAddress, { rotate: true });
      noteKeyReady();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.preauthStatus.byWallet(walletAddress),
      });
      toast.success("Payment verifier reset — update any saved pay links");
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
          <p className="text-base font-medium text-foreground">Window ended</p>
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
        body={`Paying up to ${amount} ${token.symbol} · ${secondsLeft}s left`}
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
            <p className="text-sm font-medium text-foreground">This payment</p>
            <p className="text-xs text-muted-foreground">
              Choose a token and max tap amount, then hold your NFC device to
              their phone.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">
              Allow payment verifier
            </p>
            <p className="text-xs text-muted-foreground">
              Your wallet will ask you to sign. That sets up a payment verifier
              for this wallet. It is not a transaction and does not move funds.
            </p>
          </>
        )}
      </div>

      {hasKey ? (
        <>
          <div className="flex justify-center">
            {canPickMint ? (
              <TokenChip
                token={token}
                disabled={manageBusy}
                onClick={() => setMintPickerOpen((o) => !o)}
              />
            ) : (
              <TokenSymbol token={token} size="sm" />
            )}
          </div>
          {mintPickerOpen && canPickMint ? (
            <ul className="flex flex-col gap-0.5 rounded-xl border border-border/50 bg-muted/25 p-1">
              {enabledHoldings.map((h) => (
                <li key={h.mint}>
                  <TokenListRow
                    token={h}
                    selected={h.mint === mint}
                    subtitle={`Limit ${
                      statuses.data?.get(h.mint)?.delegatedAmountUi ?? "—"
                    }`}
                    onSelect={() => {
                      setMintOverride(h.mint);
                      setAmountDraft(null);
                      setMintPickerOpen(false);
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <AmountField
            id="pay-amount"
            value={amount}
            onChange={setAmountDraft}
            token={token}
            decimals={mintQuery.data?.decimals ?? token.decimals}
            disabled={manageBusy}
          />

          <AmountPresets
            value={amount}
            onChange={setAmountDraft}
            presets={PRESETS}
            disabled={manageBusy}
          />
        </>
      ) : null}

      <p className="flex flex-wrap items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
        {hasKey && selectedLimitLabel != null ? (
          <>
            <span>Up to</span>
            <TokenSymbol token={token} size="xs" />
            <span>{selectedLimitLabel}</span>
          </>
        ) : usdcLimitLabel != null ? (
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
          <span>Needs a payment verifier for this wallet</span>
        )}
      </p>

      <div className="mt-auto flex flex-col gap-2.5">
        {hasKey ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onReady}
            disabled={manageBusy || !amount || !mintQuery.data}
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
              "Allow payment verifier"
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
