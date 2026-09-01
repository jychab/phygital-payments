"use client";

import { useState } from "react";
import { LoaderCircle, Plus, Wallet } from "lucide-react";
import type { Address } from "@solana/kit";

import { WrongWalletNotice } from "@/components/shared/wallet-notices";
import { Button } from "@/components/ui/button";
import { useCreateAtaMutation } from "@/hooks/tokens/use-create-ata-mutation";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { useWalletKitSigner } from "@/hooks/wallet/use-wallet-kit-signer";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";
import type { PaymentToken } from "@/lib/tokens/payment-token";
import { copy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Connect (optional), wrong-wallet recovery, and create-ATA button. */
export function AtaSetupActions({
  expectedOwner,
  recipient,
  mint,
  token,
  walletPreVerified = false,
  createLabel,
  pendingLabel,
  setupFailed,
  onSuccess,
}: {
  expectedOwner: string;
  recipient: Address;
  mint: Address;
  token: PaymentToken;
  /** When true, caller already gated wallet connect. */
  walletPreVerified?: boolean;
  createLabel: string;
  pendingLabel: string;
  setupFailed: string;
  onSuccess?: () => void;
}) {
  const { isConnected, matched, wrongWallet, ownerShort, connect, connectReady } =
    useExpectedWallet(expectedOwner);
  const { disconnect } = useSolanaAddress();
  const signer = useWalletKitSigner();
  const [error, setError] = useState<string | null>(null);

  const createAta = useCreateAtaMutation(mint, { onSuccess });

  async function onCreate() {
    if ((!walletPreVerified && !matched) || !signer) return;
    setError(null);
    try {
      await createAta.mutateAsync({ recipient });
    } catch (err) {
      setError(toUserErrorMessage(err, setupFailed));
    }
  }

  if (walletPreVerified) {
    return (
      <div className="flex w-full max-w-xs flex-col gap-2">
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
              {pendingLabel}
            </>
          ) : (
            <>
              <Plus className="size-4" />
              {error ? copy.common.tryAgain : createLabel}
            </>
          )}
        </Button>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={!connectReady}
        aria-busy={!connectReady}
        onClick={() => void connect()}
      >
        <Wallet className="size-4" />
        {connectReady ? copy.common.connectWallet : copy.common.loading}
      </Button>
    );
  }

  if (wrongWallet) {
    return (
      <div className="space-y-2">
        <WrongWalletNotice ownerShort={ownerShort} />
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          onClick={() => void disconnect()}
        >
          {copy.common.disconnect}
        </Button>
      </div>
    );
  }

  return (
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
            {pendingLabel}
          </>
        ) : (
          <>
            <Plus className="size-4" />
            {error ? copy.common.tryAgain : createLabel}
          </>
        )}
      </Button>
    </div>
  );
}
