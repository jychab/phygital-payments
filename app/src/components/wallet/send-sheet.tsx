"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, LoaderCircle, Nfc } from "lucide-react";
import { toast } from "sonner";
import { PolicyDeniedError } from "phygital-wallet-sdk";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { NavBar } from "@/components/shared/nav-bar";
import { TokenIcon } from "@/components/shared/token-chip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { copy } from "@/lib/copy/phygital";
import { invalidateWalletBalances } from "@/lib/queries";
import { tryParseAddress } from "@/lib/solana/address";
import { shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";
import { identifyAccessory } from "@/lib/wallet/identify-accessory";
import { createOneTimeGrant } from "@/lib/wallet/policies-client";
import { policySoftDenyBody } from "@/lib/wallet/policy-deny-copy";
import type { WalletPortfolio } from "@/lib/wallet/portfolio-types";
import { sendAssetFromWallet } from "@/lib/wallet/send-asset";
import {
  collectibleToSendAsset,
  holdingToSendAsset,
  isCollectibleSendKind,
  type SendAssetRef,
} from "@/lib/wallet/send-asset-ref";

type Phase = "form" | "holding" | "success";

function defaultAsset(
  portfolio: WalletPortfolio | undefined,
  initial: SendAssetRef | null | undefined,
  tokensOnly: boolean,
): SendAssetRef | null {
  if (initial) return initial;
  const holdings = portfolio?.holdings ?? [];
  const first = holdings.find((h) => Number(h.balanceUi) > 0) ?? holdings[0];
  if (first) return holdingToSendAsset(first);
  if (!tokensOnly) {
    const c = portfolio?.collectibles[0];
    if (c) return collectibleToSendAsset(c);
  }
  return null;
}

/** Send sheet — asset picker + amount + recipient → Hold to send. */
export function SendSheet({
  phygitalTokenPda,
  portfolio,
  initialAsset,
  tokensOnly = false,
  onClose,
  onSent,
  onChangeLimits,
}: {
  phygitalTokenPda: string;
  portfolio: WalletPortfolio | undefined;
  initialAsset?: SendAssetRef | null;
  /** When true (hero Send), picker lists fungibles only. */
  tokensOnly?: boolean;
  onClose: () => void;
  onSent: () => void;
  onChangeLimits?: (code?: string) => void;
}) {
  const queryClient = useQueryClient();
  const [asset, setAsset] = useState<SendAssetRef | null>(() =>
    defaultAsset(portfolio, initialAsset, tokensOnly),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [amount, setAmount] = useState(() =>
    initialAsset && isCollectibleSendKind(initialAsset.kind) ? "1" : "",
  );
  const [recipient, setRecipient] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [busy, setBusy] = useState(false);
  const [hardError, setHardError] = useState<string | null>(null);
  const [hardErrorCode, setHardErrorCode] = useState<string | null>(null);
  const [softDeny, setSoftDeny] = useState<PolicyDeniedError | null>(null);

  useEffect(() => {
    if (initialAsset) {
      setAsset(initialAsset);
      if (isCollectibleSendKind(initialAsset.kind)) setAmount("1");
    }
  }, [initialAsset]);

  useEffect(() => {
    if (!asset) {
      setAsset(defaultAsset(portfolio, initialAsset, tokensOnly));
    }
  }, [portfolio, initialAsset, tokensOnly, asset]);

  const nft = asset ? isCollectibleSendKind(asset.kind) : false;
  const balanceUi = useMemo(() => {
    if (!asset || !portfolio) return "0";
    if (nft) return "1";
    const h = portfolio.holdings.find((x) => x.mint === asset.mint);
    return h?.balanceUi ?? "0";
  }, [asset, portfolio, nft]);

  const balanceNum = Number(balanceUi);
  const parsedRecipient = tryParseAddress(recipient.trim());
  const amountOk =
    nft || (Number(amount) > 0 && Number(amount) <= balanceNum + 1e-9);
  const canSend = Boolean(asset && parsedRecipient && amountOk && !busy);

  async function pickRecipientNfc() {
    setBusy(true);
    try {
      const id = await identifyAccessory();
      setRecipient(String(id.walletPda));
      toast.success(copy.wallet.accessoryLinked);
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function runSend() {
    if (!asset || !parsedRecipient || !amountOk) return;
    setBusy(true);
    setHardError(null);
    setHardErrorCode(null);
    setSoftDeny(null);
    // Delay hold UI so soft-deny from preview does not flash the ceremony.
    const holdTimer = window.setTimeout(() => setPhase("holding"), 250);
    try {
      const { confirmed } = await sendAssetFromWallet({
        phygitalTokenPda,
        recipient: parsedRecipient,
        amountUi: nft ? "1" : amount,
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
      toast.success(copy.wallet.sent);
      onSent();
    } catch (e) {
      window.clearTimeout(holdTimer);
      if (e instanceof PolicyDeniedError) {
        if (e.soft && e.intentHash) {
          setSoftDeny(e);
          setPhase("form");
          return;
        }
        setPhase("form");
        setHardErrorCode(e.code);
        setHardError(
          e.code === "insufficient_fee_balance"
            ? copy.wallet.feeBalanceInsufficient
            : toUserErrorMessage(e),
        );
        if (e.code === "insufficient_fee_balance") {
          invalidateWalletBalances(queryClient, {
            tokens: [phygitalTokenPda],
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
    if (!softDeny?.intentHash) return;
    setBusy(true);
    try {
      await createOneTimeGrant(phygitalTokenPda, softDeny.intentHash);
      setSoftDeny(null);
      await runSend();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
      setBusy(false);
    }
  }

  if (phase === "holding" || phase === "success") {
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
          pulsing={phase === "holding"}
          busy={phase === "holding"}
          tone={phase === "success" ? "success" : "default"}
          imageSrc={asset?.icon}
          title={
            phase === "success" ? copy.wallet.sent : copy.wallet.holdToSend
          }
          body={
            phase === "success" ? undefined : copy.verify.holdStillBody
          }
          action={
            phase === "success" ? (
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
    const displayAmount = nft
      ? asset?.name ?? "1"
      : `${amount} ${asset?.symbol ?? ""}`;
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
              {displayAmount}
            </p>
            <p className="text-xs text-muted-foreground">
              {copy.wallet.to}{" "}
              {shortAddress(String(parsedRecipient ?? recipient), 6)}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
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
          {onChangeLimits ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={busy}
              onClick={() => onChangeLimits(softDeny.code)}
            >
              {copy.wallet.changeLimits}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const holdings = portfolio?.holdings ?? [];
  const collectibles = tokensOnly ? [] : (portfolio?.collectibles ?? []);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {copy.common.cancel}
          </Button>
        }
        title={copy.wallet.send}
      />

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="mx-auto flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1.5 text-sm transition-colors hover:bg-muted/60"
      >
        {asset ? (
          nft ? (
            <Avatar className="size-6">
              {asset.icon ? <AvatarImage src={asset.icon} alt="" /> : null}
              <AvatarFallback className="text-[10px]">
                {asset.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <TokenIcon
              token={{
                mint: asset.mint,
                symbol: asset.symbol,
                icon: asset.icon,
              }}
              className="size-6"
            />
          )
        ) : null}
        <span className="font-medium">
          {asset ? (nft ? asset.name : asset.symbol) : copy.wallet.selectAsset}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      <div className="flex flex-col items-center gap-2 pt-2">
        {nft ? (
          <>
            <p className="font-(family-name:--font-display) text-4xl font-light tabular-nums">
              1
            </p>
            <p className="text-sm text-muted-foreground">
              {copy.wallet.sendCollectible}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <Input
                variant="hero"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                aria-label={copy.wallet.send}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {copy.wallet.ofAvailableAsset(balanceUi, asset?.symbol ?? "")}
            </p>
            <button
              type="button"
              className="text-xs font-medium text-primary"
              onClick={() => setAmount(balanceUi)}
            >
              {copy.wallet.max}
            </button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="px-1 text-xs font-medium text-muted-foreground">
          {copy.wallet.to}
        </label>
        <div className="flex gap-2">
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value.trim())}
            placeholder={copy.wallet.pasteAddress}
            className="flex-1 font-mono text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={copy.wallet.tapAccessory}
            disabled={busy}
            onClick={() => void pickRecipientNfc()}
          >
            {busy && phase === "form" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Nfc className="size-4" />
            )}
          </Button>
        </div>
        {parsedRecipient ? (
          <p className="px-1 text-xs text-muted-foreground">
            {shortAddress(String(parsedRecipient), 6)}
          </p>
        ) : null}
      </div>

      {hardError ? (
        <div className="rounded-2xl bg-muted/25 px-4 py-3 text-sm text-muted-foreground">
          <p>{hardError}</p>
          {onChangeLimits ? (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-primary"
              onClick={() => onChangeLimits(hardErrorCode ?? undefined)}
            >
              {hardErrorCode === "insufficient_fee_balance"
                ? copy.wallet.topUpFees
                : copy.wallet.changeLimits}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canSend}
          onClick={() => void runSend()}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.holdToSend
          )}
        </Button>
      </div>

      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[80vh] max-w-lg overflow-y-auto rounded-t-3xl"
        >
          <SheetHeader className="text-left">
            <SheetTitle>{copy.wallet.selectAsset}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 pb-6">
            {holdings.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {copy.wallet.tokens}
                </p>
                <ul className="overflow-hidden rounded-2xl bg-muted/25">
                  {holdings.map((h) => {
                    const ref = holdingToSendAsset(h);
                    return (
                      <li key={h.mint} className="border-b border-border/40 last:border-0">
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted/50"
                          onClick={() => {
                            setAsset(ref);
                            if (isCollectibleSendKind(ref.kind)) setAmount("1");
                            else if (nft) setAmount("");
                            setPickerOpen(false);
                          }}
                        >
                          <TokenIcon
                            token={{
                              mint: h.mint,
                              symbol: h.symbol,
                              icon: h.icon,
                            }}
                            className="size-8"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {h.symbol}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {h.name}
                            </p>
                          </div>
                          <p className="text-sm tabular-nums">{h.balanceUi}</p>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {collectibles.length > 0 ? (
              <div>
                <Separator className="mb-4" />
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  {copy.wallet.collectibles}
                </p>
                <ul className="overflow-hidden rounded-2xl bg-muted/25">
                  {collectibles.map((c) => {
                    const ref = collectibleToSendAsset(c);
                    return (
                      <li key={c.mint} className="border-b border-border/40 last:border-0">
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-muted/50"
                          onClick={() => {
                            setAsset(ref);
                            setAmount("1");
                            setPickerOpen(false);
                          }}
                        >
                          <Avatar className="size-8 rounded-lg">
                            {c.image ? (
                              <AvatarImage src={c.image} alt="" className="rounded-lg" />
                            ) : null}
                            <AvatarFallback className="rounded-lg text-[10px]">
                              {c.name.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {c.name}
                            </p>
                            {c.collectionName ? (
                              <p className="truncate text-xs text-muted-foreground">
                                {c.collectionName}
                              </p>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
