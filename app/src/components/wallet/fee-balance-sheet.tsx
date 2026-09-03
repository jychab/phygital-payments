"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PolicyDeniedError } from "phygital-wallet-sdk";

import { NavBar } from "@/components/shared/nav-bar";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFeeBalance } from "@/hooks/wallet/use-fee-balance";
import { copy } from "@/lib/copy/phygital";
import { queryKeys } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import { topUpFeeBalance } from "@/lib/wallet/top-up-fee-balance";

type Phase = "form" | "holding" | "success";

/** Settings → network fees: show balance + Hold to top up. */
export function FeeBalanceSheet({
  phygitalTokenPda,
  onBack,
}: {
  phygitalTokenPda: string;
  onBack: () => void;
}) {
  const fee = useFeeBalance(phygitalTokenPda);
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("0.01");
  const [phase, setPhase] = useState<Phase>("form");
  const [busy, setBusy] = useState(false);

  const canTopUp = Number(amount) > 0 && !busy;

  async function runTopUp() {
    if (!canTopUp) return;
    setBusy(true);
    const holdTimer = window.setTimeout(() => setPhase("holding"), 250);
    try {
      const { confirmed } = await topUpFeeBalance({
        phygitalTokenPda,
        amountUi: amount,
      });
      window.clearTimeout(holdTimer);
      setPhase("holding");
      await confirmed;
      setPhase("success");
      toast.success(copy.wallet.topUpSuccess);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.feeBalance.byToken(phygitalTokenPda),
      });
    } catch (e) {
      window.clearTimeout(holdTimer);
      setPhase("form");
      if (e instanceof PolicyDeniedError) {
        toast.error(e.message);
      } else {
        toast.error(toUserErrorMessage(e));
      }
    } finally {
      window.clearTimeout(holdTimer);
      setBusy(false);
    }
  }

  if (phase === "holding" || phase === "success") {
    return (
      <div className="flex flex-1 flex-col">
        <NavBar
          leading={
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
              {copy.common.cancel}
            </Button>
          }
        />
        <NfcHoldStatus
          size="lg"
          pulsing={phase === "holding"}
          busy={phase === "holding"}
          tone={phase === "success" ? "success" : "default"}
          title={
            phase === "success"
              ? copy.wallet.topUpSuccess
              : copy.wallet.holdToTopUp
          }
          body={
            phase === "success"
              ? copy.wallet.topUpPending
              : copy.verify.holdStillBody
          }
          action={
            phase === "success" ? (
              <Button type="button" size="lg" className="w-full" onClick={onBack}>
                {copy.common.done}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            {copy.common.back}
          </Button>
        }
        title={copy.wallet.feeBalance}
      />

      <div className="flex flex-col gap-2 px-1">
        <p className="text-sm text-muted-foreground">
          {copy.wallet.feeBalanceHint}
        </p>
        <p className="font-(family-name:--font-display) text-3xl tabular-nums">
          {fee.isLoading ? "…" : `${fee.data?.balanceUi ?? "0"} SOL`}
        </p>
        {fee.data?.low ? (
          <p className="text-sm text-muted-foreground">
            {copy.wallet.feeBalanceLow}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="px-1 text-xs font-medium text-muted-foreground">
          {copy.wallet.topUpAmount}
        </label>
        <Input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0.01"
        />
      </div>

      <div className="mt-auto">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!canTopUp}
          onClick={() => void runTopUp()}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.holdToTopUp
          )}
        </Button>
      </div>
    </div>
  );
}
