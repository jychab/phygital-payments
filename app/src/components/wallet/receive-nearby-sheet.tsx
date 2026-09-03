"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { PolicyDeniedError } from "phygital-wallet-sdk";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { NavBar } from "@/components/shared/nav-bar";
import { TokenIcon } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useVerifiedTokens } from "@/hooks/wallet/use-verified-tokens";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import { copy } from "@/lib/copy/phygital";
import { invalidateWalletBalances } from "@/lib/queries";
import { shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";
import { pushLocalWalletActivity } from "@/lib/wallet/activity-local";
import { identifyAccessory } from "@/lib/wallet/identify-accessory";
import { createOneTimeGrant } from "@/lib/wallet/policies-client";
import { policySoftDenyBody } from "@/lib/wallet/policy-deny-copy";
import { ALL_LIST_SEARCH_THRESHOLD } from "@/lib/wallet/portfolio-preview";
import { receiveAssetFromNearbyPayer } from "@/lib/wallet/send-asset";
import {
  paymentTokenToSendAsset,
  type SendAssetRef,
} from "@/lib/wallet/send-asset-ref";

type LinkedPayer = {
  walletPda: string;
  tokenPda: string;
};

type Phase = "form" | "identifying" | "holding" | "success";

/** Receive nearby — pick verified token → amount → tap From → Hold. */
export function ReceiveNearbySheet({
  recipientWallet,
  onClose,
  onReceived,
}: {
  recipientWallet: string;
  onClose: () => void;
  onReceived: () => void;
}) {
  const queryClient = useQueryClient();
  const verified = useVerifiedTokens();
  const catalog = verified.data ?? [];
  const catalogLoading = verified.isLoading && !verified.data;
  const [asset, setAsset] = useState<SendAssetRef | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState<LinkedPayer | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [busy, setBusy] = useState(false);
  const [hardError, setHardError] = useState<string | null>(null);
  const [softDeny, setSoftDeny] = useState<PolicyDeniedError | null>(null);

  const payerPortfolio = useWalletPortfolio(from?.walletPda ?? null);

  useEffect(() => {
    if (verified.isError) toast.error(toUserErrorMessage(verified.error));
  }, [verified.isError, verified.error]);

  useEffect(() => {
    const first = verified.data?.[0];
    if (!first) return;
    setAsset((prev) => prev ?? paymentTokenToSendAsset(first));
  }, [verified.data]);

  const payerBalanceUi = useMemo(() => {
    if (!from || !asset || !payerPortfolio.data) return null;
    return (
      payerPortfolio.data.holdings.find((x) => x.mint === asset.mint)
        ?.balanceUi ?? "0"
    );
  }, [from, asset, payerPortfolio.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter(
      (t) =>
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.mint.toLowerCase().includes(q),
    );
  }, [catalog, search]);

  const amountOk = Number(amount) > 0;
  const canReceive = Boolean(from && asset && amountOk && !busy);
  const showSearch = catalog.length >= ALL_LIST_SEARCH_THRESHOLD;

  async function identifyFrom() {
    setPhase("identifying");
    setBusy(true);
    try {
      const id = await identifyAccessory();
      if (String(id.walletPda) === recipientWallet) {
        throw new Error("You can’t receive from this accessory");
      }
      setFrom({
        walletPda: String(id.walletPda),
        tokenPda: String(id.token.address),
      });
      setHardError(null);
      setSoftDeny(null);
      toast.success(copy.wallet.accessoryLinked);
      setPhase("form");
    } catch (e) {
      setPhase("form");
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function clearFrom() {
    setFrom(null);
    setHardError(null);
    setSoftDeny(null);
  }

  async function runReceive() {
    if (!from || !asset || !amountOk) return;
    setBusy(true);
    setHardError(null);
    setSoftDeny(null);
    const holdTimer = window.setTimeout(() => setPhase("holding"), 250);
    try {
      const { signature, confirmed } = await receiveAssetFromNearbyPayer({
        payerPhygitalTokenPda: from.tokenPda,
        expectedPayerWallet: from.walletPda,
        recipientWallet,
        amountUi: amount,
        asset: {
          kind: asset.kind,
          mint: asset.mint,
          decimals: asset.decimals,
          tokenProgram: asset.tokenProgram,
        },
      });
      window.clearTimeout(holdTimer);
      setPhase("holding");
      await confirmed;
      setPhase("success");
      pushLocalWalletActivity({
        id: signature,
        walletAddress: recipientWallet,
        kind: "received",
        title: copy.wallet.received,
        subtitle: from.walletPda,
        amountLabel: `+${amount} ${asset.symbol}`,
        statusLabel: null,
        timestamp: Math.floor(Date.now() / 1000),
        signature,
        mint: asset.mint,
        balanceDeltas: [
          {
            mint: asset.mint,
            direction: "in",
            amountUi: amount,
          },
        ],
        pending: false,
        source: "local",
      });
      toast.success(copy.wallet.received);
      // Payer spent assets + fees; recipient gained assets.
      invalidateWalletBalances(queryClient, {
        wallets: [recipientWallet, from.walletPda],
        tokens: [from.tokenPda],
      });
      onReceived();
    } catch (e) {
      window.clearTimeout(holdTimer);
      if (e instanceof PolicyDeniedError) {
        if (e.soft && e.intentHash) {
          setSoftDeny(e);
          setPhase("form");
          return;
        }
        setPhase("form");
        setHardError(
          e.code === "insufficient_fee_balance"
            ? copy.wallet.feeBalanceInsufficient
            : toUserErrorMessage(e),
        );
        if (e.code === "insufficient_fee_balance") {
          invalidateWalletBalances(queryClient, {
            tokens: [from.tokenPda],
          });
        }
        return;
      }
      setPhase("form");
      toast.error(toUserErrorMessage(e));
    } finally {
      window.clearTimeout(holdTimer);
      setBusy(false);
    }
  }

  async function approveOnce() {
    if (!softDeny?.intentHash || !from) return;
    setBusy(true);
    try {
      await createOneTimeGrant(from.tokenPda, softDeny.intentHash);
      pushLocalWalletActivity({
        id: `approved:${from.walletPda}:${asset?.mint ?? "unknown"}:${Date.now()}`,
        walletAddress: recipientWallet,
        kind: "approved",
        title: copy.wallet.approveOnce,
        subtitle: from.walletPda,
        amountLabel: null,
        statusLabel: null,
        timestamp: Math.floor(Date.now() / 1000),
        signature: null,
        mint: null,
        pending: false,
        source: "local",
      });
      setSoftDeny(null);
      await runReceive();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
      setBusy(false);
    }
  }

  if (phase === "identifying" || phase === "holding" || phase === "success") {
    const success = phase === "success";
    const identifying = phase === "identifying";
    return (
      <div className="flex flex-1 flex-col">
        <NavBar
          leading={
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {copy.common.cancel}
            </Button>
          }
        />
        <NfcHoldStatus
          size="lg"
          pulsing={!success}
          busy={!success}
          tone={success ? "success" : "default"}
          imageSrc={asset?.icon}
          title={
            success
              ? copy.wallet.received
              : identifying
                ? copy.wallet.tapTheirAccessory
                : copy.wallet.holdToReceive
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

  if (softDeny) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <NavBar
          leading={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSoftDeny(null)}
            >
              {copy.common.cancel}
            </Button>
          }
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
          <h2 className="font-(family-name:--font-display) text-2xl font-medium">
            {copy.wallet.approveSendTitle}
          </h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            {policySoftDenyBody(softDeny)}
          </p>
          <div className="w-full max-w-sm rounded-2xl bg-muted/25 px-4 py-3 text-left">
            <p className="font-(family-name:--font-display) text-lg">
              {amount} {asset?.symbol ?? ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {copy.wallet.from} {shortAddress(from?.walletPda ?? "", 6)}
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={() => void approveOnce()}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.approveOnce
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {copy.common.cancel}
          </Button>
        }
        title={copy.wallet.receiveNearby}
      />

      <button
        type="button"
        disabled={catalogLoading || catalog.length === 0}
        onClick={() => setPickerOpen(true)}
        className="mx-auto flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5 text-sm transition-colors hover:bg-muted/60 disabled:opacity-50"
      >
        {catalogLoading ? (
          <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
        ) : asset ? (
          <TokenIcon
            token={{
              mint: asset.mint,
              symbol: asset.symbol,
              icon: asset.icon,
            }}
            className="size-6"
          />
        ) : null}
        <span className="font-medium">
          {asset?.symbol ?? copy.wallet.selectAsset}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="flex items-baseline gap-1">
          <Input
            variant="hero"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            disabled={!asset}
            onChange={(e) =>
              setAmount(e.target.value.replace(/[^0-9.]/g, ""))
            }
            aria-label={copy.wallet.receive}
          />
        </div>
        {from && payerBalanceUi != null && asset ? (
          <>
            <p className="text-sm text-muted-foreground">
              {copy.wallet.ofAvailableAsset(payerBalanceUi, asset.symbol)}
            </p>
            <button
              type="button"
              className="text-xs font-medium text-primary"
              onClick={() => setAmount(payerBalanceUi)}
            >
              {copy.wallet.max}
            </button>
          </>
        ) : null}
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
              onClick={clearFrom}
            >
              {copy.wallet.clear}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-12 justify-start"
            disabled={busy || !asset || !amountOk}
            onClick={() => void identifyFrom()}
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              copy.wallet.tapTheirAccessory
            )}
          </Button>
        )}
      </div>

      {hardError ? (
        <div className="rounded-2xl bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
          <p>{hardError}</p>
        </div>
      ) : null}

      <div className="mt-auto">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canReceive}
          onClick={() => void runReceive()}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.holdToReceive
          )}
        </Button>
      </div>

      <Sheet
        open={pickerOpen}
        onOpenChange={(open) => {
          setPickerOpen(open);
          if (!open) setSearch("");
        }}
      >
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[80vh] max-w-lg overflow-y-auto rounded-t-3xl"
        >
          <SheetHeader className="text-left">
            <SheetTitle>{copy.wallet.selectAsset}</SheetTitle>
          </SheetHeader>
          <div className="space-y-3 px-4 pb-6">
            {showSearch ? (
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={copy.wallet.searchTokens}
                className="text-sm"
              />
            ) : null}
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {copy.wallet.noMatchingTokens}
              </p>
            ) : (
              <ul className="overflow-hidden rounded-2xl bg-muted/25">
                {filtered.map((t) => {
                  const ref = paymentTokenToSendAsset(t);
                  return (
                    <li
                      key={t.mint}
                      className="border-b border-border/40 last:border-0"
                    >
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted/50"
                        onClick={() => {
                          setAsset(ref);
                          setPickerOpen(false);
                          setSearch("");
                        }}
                      >
                        <TokenIcon
                          token={t}
                          className="size-8"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {t.symbol}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.name}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
