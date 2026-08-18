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

/** Enable Pay on this phone (wallet sign + store key in localStorage). */
export function AllowVerifierPanel({
  expectedOwner,
  onAllowed,
  onSkip,
}: {
  expectedOwner: string;
  onAllowed: () => void;
  onSkip?: () => void;
}) {
  const { address, isConnected, ready, connect } = useSolanaAddress();
  const { provisionKey } = useDevicePayKeyHelpers();
  const [busy, setBusy] = useState(false);

  const wrongWallet =
    isConnected && address != null && address !== expectedOwner;
  const matched = isConnected && address === expectedOwner;

  async function onEnable() {
    if (!matched) return;
    try {
      setBusy(true);
      await provisionKey(expectedOwner);
      onAllowed();
      toast.success("Pay is on");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn't enable Pay"));
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
        body={`Connect ${shortAddress(expectedOwner, 4)} to enable Pay.`}
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
        <p className="text-sm font-medium text-foreground">Enable Pay</p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Your wallet will ask you to sign. It does not move funds.
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onEnable()}
          disabled={busy}
        >
          {busy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Enable Pay…
            </>
          ) : (
            "Enable Pay"
          )}
        </Button>
        {onSkip ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onSkip}
          >
            Not Now
          </Button>
        ) : null}
      </div>
    </div>
  );
}
