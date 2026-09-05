"use client";

import { useEffect, useState } from "react";

import { NavBar, NavBarBack } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import { FieldLabel, Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { usePolicyEditor } from "@/hooks/wallet/use-wallet-policy";
import { copy } from "@/lib/copy/phygital";

/** Max per-send USDC / SOL limits. */
export function SpendingLimitsSheet({
  phygitalTokenPda,
  onBack,
}: {
  phygitalTokenPda: string;
  onBack: () => void;
}) {
  const editor = usePolicyEditor(phygitalTokenPda);
  const [maxPerSend, setMaxPerSend] = useState("");
  const [maxSol, setMaxSol] = useState("");

  useEffect(() => {
    if (!editor.settings) return;
    setMaxPerSend(editor.settings.maxTransferUsdc ?? "");
    setMaxSol(editor.settings.maxTransferSol ?? "");
  }, [editor.settings]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <NavBar
        leading={<NavBarBack onClick={onBack} />}
        title={copy.wallet.spendingLimits}
      />
      {editor.loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {editor.policyInvalid
              ? copy.wallet.limitsInvalidBody
              : editor.policyEnabled
                ? copy.wallet.spendingLimitsHint
                : copy.wallet.policyDefaultSigningOnly}
          </p>
          {!editor.policyInvalid && !editor.policyEnabled ? (
            <p className="text-sm text-muted-foreground">
              {copy.wallet.spendingLimitsHint}
            </p>
          ) : null}
          <FieldLabel className="normal-case tracking-normal text-xs">
            {copy.wallet.maxPerSend}
          </FieldLabel>
          <Input
            inputMode="decimal"
            value={maxPerSend}
            onChange={(e) =>
              setMaxPerSend(e.target.value.replace(/[^0-9.]/g, ""))
            }
            placeholder="50"
          />
          <FieldLabel className="normal-case tracking-normal text-xs">
            {copy.wallet.maxSolPerSend}
          </FieldLabel>
          <Input
            inputMode="decimal"
            value={maxSol}
            onChange={(e) => setMaxSol(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.1"
          />
          <div className="mt-auto flex flex-col gap-2">
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={editor.busy}
              onClick={() =>
                void editor.save(
                  {
                    maxTransferUsdc: maxPerSend.trim() || null,
                    maxTransferSol: maxSol.trim() || null,
                  },
                  onBack,
                )
              }
            >
              {editor.saving ? (
                <Spinner className="size-4" />
              ) : (
                copy.wallet.save
              )}
            </Button>
            {editor.policyEnabled ? (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={editor.busy}
                onClick={() => void editor.turnOff(onBack)}
              >
                {editor.turningOff ? (
                  <Spinner className="size-4" />
                ) : (
                  copy.wallet.limitsTurnOff
                )}
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
