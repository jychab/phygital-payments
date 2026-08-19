"use client";

import { toast } from "sonner";
import {
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  Plus,
  Wallet,
} from "lucide-react";

import { AppCard, AppShell } from "@/components/layout/app-shell";
import { CopyableAddress } from "@/components/shared/copyable-address";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { useCreateAtaMutation } from "@/hooks/collect/use-create-ata-mutation";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { useMintProgram } from "@/hooks/tokens/use-mint-program";
import { useRecipientAtaStatus } from "@/hooks/collect/use-recipient-ata-status";
import {
  collectHref,
  type PaymentRequest,
} from "@/lib/collect/payment-request";
import {
  resolvePaymentToken,
} from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { shortAddress } from "@/lib/utils";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";
import { useVerifiedTokens } from "@/hooks/tokens/use-verified-tokens";

/**
 * Route `/setup` — one-time receive-account (ATA) creation. Connect required.
 * After success, open Collect in a new tab.
 */
export function SetupCollectApp({
  paymentRequest,
}: {
  paymentRequest: PaymentRequest;
}) {
  const embedded = useIsEmbedded();
  const {
    address: connectedAddress,
    isConnected,
    ready,
    connect,
    disconnect,
  } = useSolanaAddress();
  const signer = useWalletKitSigner();

  const recipient = paymentRequest.recipient;
  const mint = paymentRequest.mint;
  const verified = useVerifiedTokens();
  const token = resolvePaymentToken(mint, verified.data);
  const mintQuery = useMintProgram(mint);
  const ataQuery = useRecipientAtaStatus(
    recipient,
    mint,
    mintQuery.data?.program,
  );
  const ataExists = ataQuery.data?.exists === true;
  const ataLoading = Boolean(recipient) && ataQuery.isLoading;

  const createAta = useCreateAtaMutation(mint, {
    onSuccess: () => toast.success("Receive account ready"),
  });

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    return (
      <EmbedError
        title="Can’t set up here"
        body="Open this setup link in Safari or Chrome instead of inside this page."
      />
    );
  }

  if (!recipient) {
    return (
      <EmbedError
        title="Setup link isn’t complete"
        body="Open a setup link that includes ?recipient=…"
      />
    );
  }

  const matches = isConnected && connectedAddress === recipient;
  const wrongWallet =
    isConnected && connectedAddress != null && connectedAddress !== recipient;
  const collectUrl = collectHref({
    recipient,
    mint,
    amount: paymentRequest.amount,
  });

  async function onCreate() {
    if (!recipient || !matches || !signer) return;
    try {
      await createAta.mutateAsync({ recipient });
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t set up to receive"));
    }
  }

  return (
    <AppShell modeLabel="Setup" walletActions="full">
      <AppCard>
        {!ready || ataLoading ? (
          <CenteredStatus>
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Checking…</p>
          </CenteredStatus>
        ) : ataExists ? (
          <CenteredStatus>
            <div className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="size-7" />
            </div>
            <p className="text-base font-medium text-foreground">Ready to collect</p>
            <p className="max-w-56 text-sm text-muted-foreground">
              This wallet can receive{" "}
              <TokenSymbol
                token={token}
                size="xs"
                className="mx-0.5"
                symbolClassName="font-medium text-foreground"
              />
              . Open Collect in a new tab to continue.
            </p>
            <Button type="button" className="mt-2 gap-1.5" asChild>
              <a href={collectUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                Open Collect
              </a>
            </Button>
          </CenteredStatus>
        ) : !isConnected ? (
          <GateMessage
            icon={<Wallet className="size-5 text-muted-foreground" />}
            title="Connect to set up"
            body={
              <>
                Connect {shortAddress(recipient, 4)} above to create its{" "}
                <TokenSymbol
                  token={token}
                  size="xs"
                  className="mx-0.5"
                  symbolClassName="font-medium text-foreground"
                />{" "}
                receive account.
              </>
            }            action={
              <div className="flex w-full max-w-64 flex-col items-center gap-3">
                <div className="flex w-full items-center justify-between gap-2 rounded-xl bg-muted/35 px-4 py-2.5 text-xs">
                  <span className="text-muted-foreground">Wallet</span>
                  <CopyableAddress
                    address={recipient}
                    length={6}
                    label="recipient"
                  />
                </div>
                <Button type="button" size="lg" className="w-full" onClick={connect}>
                  Connect wallet
                </Button>
              </div>
            }
          />
        ) : wrongWallet ? (
          <GateMessage
            icon={<Wallet className="size-5 text-muted-foreground" />}
            title="Wrong wallet"
            body={`Disconnect above, then connect ${shortAddress(recipient, 4)}.`}
            action={
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => void disconnect()}
              >
                Disconnect
              </Button>
            }
          />
        ) : (
          <div className="flex flex-1 flex-col gap-5 py-2">
            <div className="space-y-1.5 text-center">
              <p className="text-sm font-medium text-foreground">
                Create receive account
              </p>
              <p className="mx-auto max-w-64 text-sm text-muted-foreground">
                One-time setup so this wallet can receive{" "}
                <TokenSymbol
                  token={token}
                  size="xs"
                  className="mx-0.5"
                  symbolClassName="font-medium text-foreground"
                />
                . Your wallet pays a small network rent.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/35 px-4 py-2.5 text-xs">
              <span className="text-muted-foreground">Wallet</span>
              <CopyableAddress
                address={recipient}
                length={6}
                label="recipient"
              />
            </div>

            <Button
              type="button"
              size="lg"
              className="w-full gap-1.5"
              disabled={createAta.isPending || !signer}
              onClick={() => void onCreate()}
            >
              {createAta.isPending ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Create receive account
                </>
              )}
            </Button>
          </div>
        )}
      </AppCard>
    </AppShell>
  );
}
