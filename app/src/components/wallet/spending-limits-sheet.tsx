"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

import { NavBar } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    if (!editor.policy.data) return;
    setMaxPerSend(editor.policy.data.maxTransferUsdc ?? "");
    setMaxSol(editor.policy.data.maxTransferSol ?? "");
  }, [editor.policy.data]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            {copy.common.back}
          </Button>
        }
        title={copy.wallet.spendingLimits}
      />
      {editor.loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {copy.wallet.spendingLimitsHint}
          </p>
          <p className="text-xs text-muted-foreground">
            {copy.wallet.policyDefaultSigningOnly}
          </p>
          <label className="text-xs text-muted-foreground">
            {copy.wallet.maxPerSend}
          </label>
          <Input
            inputMode="decimal"
            value={maxPerSend}
            onChange={(e) =>
              setMaxPerSend(e.target.value.replace(/[^0-9.]/g, ""))
            }
            placeholder="50"
          />
          <label className="text-xs text-muted-foreground">
            {copy.wallet.maxSolPerSend}
          </label>
          <Input
            inputMode="decimal"
            value={maxSol}
            onChange={(e) => setMaxSol(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.1"
          />
          <Button
            type="button"
            size="lg"
            className="mt-auto"
            disabled={editor.saving}
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
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              copy.wallet.holdToSave
            )}
          </Button>
        </>
      )}
    </div>
  );
}
