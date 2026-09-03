"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copy } from "@/lib/copy/phygital";
import {
  fetchEffectivePolicy,
  putPolicySummary,
} from "@/lib/wallet/policies-client";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Max per-send USDC / SOL limits. */
export function SpendingLimitsSheet({
  phygitalTokenPda,
  onBack,
}: {
  phygitalTokenPda: string;
  onBack: () => void;
}) {
  const [maxPerSend, setMaxPerSend] = useState("");
  const [maxSol, setMaxSol] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const summary = await fetchEffectivePolicy(phygitalTokenPda);
        if (cancelled) return;
        setMaxPerSend(summary.maxTransferUsdc ?? "");
        setMaxSol(summary.maxTransferSol ?? "");
      } catch (e) {
        toast.error(toUserErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phygitalTokenPda]);

  async function save() {
    setSaving(true);
    try {
      await putPolicySummary(phygitalTokenPda, {
        maxTransferUsdc: maxPerSend.trim() || null,
        maxTransferSol: maxSol.trim() || null,
      });
      toast.success(copy.wallet.settingsSaved);
      onBack();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {copy.common.back}
        </Button>
        <p className="text-sm font-medium">{copy.wallet.spendingLimits}</p>
        <span className="w-16" aria-hidden />
      </div>
      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {copy.wallet.spendingLimitsHint}
          </p>
          <label className="text-xs text-muted-foreground">
            {copy.wallet.maxPerSend}
          </label>
          <Input
            inputMode="decimal"
            value={maxPerSend}
            onChange={(e) => setMaxPerSend(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="50"
          />
          <label className="text-xs text-muted-foreground">Max SOL per send</label>
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
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              copy.wallet.save
            )}
          </Button>
        </>
      )}
    </div>
  );
}
