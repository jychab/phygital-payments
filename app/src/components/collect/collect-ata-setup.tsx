"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  LoaderCircle,
  Plus,
  Wallet,
} from "lucide-react";
import type { Address } from "@solana/kit";

import { PrivyGate } from "@/app/privy-wallet-root";
import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { useCreateAtaMutation } from "@/hooks/collect/use-create-ata-mutation";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import type { PaymentToken } from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * In-place receive-account setup on `/collect`. Same connect → sign flow as
 * device claim (`FinishClaimPanel`): Connect wallet, then confirm the tx.
 */
export function CollectAtaSetup({
  recipient,
  mint,
  token,
}: {
  recipient: Address;
  mint: Address;
  token: PaymentToken;
}) {
  return (
    <PrivyGate
      fallback={
        <div className="flex justify-center py-2">
          <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CollectAtaSetupCard recipient={recipient} mint={mint} token={token} />
    </PrivyGate>
  );
}

function CollectAtaSetupCard({
  recipient,
  mint,
  token,
}: {
  recipient: Address;
  mint: Address;
  token: PaymentToken;
}) {
  const { ready, isConnected, matched, wrongWallet, ownerShort, connect } =
    useExpectedWallet(String(recipient));
  const { disconnect } = useSolanaAddress();
  const signer = useWalletKitSigner();
  const [error, setError] = useState<string | null>(null);

  const createAta = useCreateAtaMutation(mint, {
    onSuccess: () => toast.success("Receive account ready"),
  });

  async function onCreate() {
    if (!matched || !signer) return;
    setError(null);
    try {
      await createAta.mutateAsync({ recipient });
    } catch (err) {
      setError(toUserErrorMessage(err, "Couldn’t set up to receive"));
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertCircle className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-2.5">
        <p className="text-sm font-medium text-foreground">
          Receive Account Needed
        </p>
        <p className="text-xs text-muted-foreground">
          This wallet needs a one-time{" "}
          <TokenSymbol
            token={token}
            size="xs"
            className="mx-0.5"
            symbolClassName="font-medium text-foreground"
          />{" "}
          receive account. Connect the matching wallet to create it.
        </p>
        {!ready ? (
          <div className="flex justify-center py-1">
            <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : !isConnected ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={connect}
          >
            <Wallet className="size-4" />
            Connect wallet
          </Button>
        ) : wrongWallet ? (
          <div className="space-y-2">
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
              Wrong wallet. Disconnect, then connect {ownerShort}.
            </p>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => void disconnect()}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {error ? (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
                {error}
              </p>
            ) : null}
            <Button
              type="button"
              size="lg"
              className="w-full"
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
                  {error ? "Try again" : "Create receive account"}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
