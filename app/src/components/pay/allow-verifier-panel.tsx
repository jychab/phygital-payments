"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Smartphone, Wallet } from "lucide-react";

import { GateMessage } from "@/components/gate-message";
import { Button } from "@/components/ui/button";
import { useDevicePayKeyHelpers } from "@/lib/payments/device-pay-key-client";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";
import { shortAddress } from "@/lib/utils";

/**
 * Sign-message provision for a payment verifier. Wallet must match `expectedOwner`.
 */
export function AllowVerifierPanel({
  expectedOwner,
  onAllowed,
}: {
  expectedOwner: string;
  onAllowed: (apiKey: string) => void;
}) {
  const { address, isConnected, ready, connect } = useSolanaAddress();
  const { provisionKey } = useDevicePayKeyHelpers();
  const [busy, setBusy] = useState(false);

  const wrongWallet =
    isConnected && address != null && address !== expectedOwner;
  const matched = isConnected && address === expectedOwner;

  async function onAllow() {
    if (!matched) return;
    try {
      setBusy(true);
      const apiKey = await provisionKey(expectedOwner);
      onAllowed(apiKey);
      toast.success("Payment verifier enabled for this wallet");
    } catch (error) {
      toast.error(
        toUserErrorMessage(error, "Couldn’t allow the payment verifier"),
      );
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-muted-foreground" />}
        title="Connect your wallet"
        body={`Connect ${shortAddress(expectedOwner, 4)} to allow the payment verifier.`}
        action={
          <Button
            type="button"
            size="lg"
            className="w-full max-w-64"
            onClick={connect}
          >
            Connect wallet
          </Button>
        }
      />
    );
  }

  if (wrongWallet) {
    return (
      <GateMessage
        icon={<Wallet className="size-5 text-destructive" />}
        title="Wrong wallet"
        body={`Disconnect above, then connect ${shortAddress(expectedOwner, 4)}.`}
        destructive
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="space-y-1.5 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
          <Smartphone className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          Allow payment verifier
        </p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Your wallet will ask you to sign. That sets up a payment verifier for
          this wallet. It is not a transaction and does not move funds.
        </p>
      </div>
      <div className="mt-auto">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onAllow()}
          disabled={busy}
        >
          {busy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Sign in your wallet…
            </>
          ) : (
            "Allow payment verifier"
          )}
        </Button>
      </div>
    </div>
  );
}
