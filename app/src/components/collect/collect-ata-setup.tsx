"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  LoaderCircle,
  Plus,
} from "lucide-react";
import type { Address } from "@solana/kit";

import { TokenSymbol } from "@/components/shared/token-chip";
import { Button } from "@/components/ui/button";
import { useCreateAtaMutation } from "@/hooks/collect/use-create-ata-mutation";
import type { PaymentToken } from "@/lib/tokens/payment-token";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * In-place receive-account setup on `/collect`. The fee-payer creates the ATA.
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
  const [error, setError] = useState<string | null>(null);
  const createAta = useCreateAtaMutation(mint, {
    onSuccess: () => toast.success("Ready to receive"),
  });

  async function onCreate() {
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
          Finish Setup
        </p>
        <p className="text-xs text-muted-foreground">
          This wallet isn’t ready to receive{" "}
          <TokenSymbol
            token={token}
            size="xs"
            className="mx-0.5"
            symbolClassName="font-medium text-foreground"
          />{" "}
          yet.
        </p>
        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
            {error}
          </p>
        ) : null}
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={createAta.isPending}
          onClick={() => void onCreate()}
        >
          {createAta.isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Setting up…
            </>
          ) : (
            <>
              <Plus className="size-4" />
              {error ? "Try again" : "Set up receiving"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
