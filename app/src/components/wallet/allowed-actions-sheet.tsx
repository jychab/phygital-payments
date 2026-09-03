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

const PAYMENTS_DEFAULT = [
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  "11111111111111111111111111111111",
  "ComputeBudget111111111111111111111111111111",
];

/** Payments-only vs custom program allowlist. */
export function AllowedActionsSheet({
  phygitalTokenPda,
  onBack,
}: {
  phygitalTokenPda: string;
  onBack: () => void;
}) {
  const [preset, setPreset] = useState<"payments" | "custom">("payments");
  const [programs, setPrograms] = useState<string[]>(PAYMENTS_DEFAULT);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const summary = await fetchEffectivePolicy(phygitalTokenPda);
        if (cancelled) return;
        const list = summary.allowedPrograms;
        const isDefault =
          list.length === PAYMENTS_DEFAULT.length &&
          PAYMENTS_DEFAULT.every((p) => list.includes(p));
        setPreset(isDefault ? "payments" : "custom");
        setPrograms(list.length ? list : PAYMENTS_DEFAULT);
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
        allowedPrograms:
          preset === "payments" ? [...PAYMENTS_DEFAULT] : programs,
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
        <p className="text-sm font-medium">{copy.wallet.allowedActions}</p>
        <span className="w-16" aria-hidden />
      </div>
      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <Button
            type="button"
            variant={preset === "payments" ? "default" : "outline"}
            onClick={() => {
              setPreset("payments");
              setPrograms([...PAYMENTS_DEFAULT]);
            }}
          >
            {copy.wallet.paymentsOnly}
          </Button>
          <Button
            type="button"
            variant={preset === "custom" ? "default" : "outline"}
            onClick={() => setPreset("custom")}
          >
            {copy.wallet.advancedPrograms}
          </Button>
          {preset === "custom" ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.trim())}
                  placeholder="Program ID"
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!draft || programs.includes(draft)) return;
                    setPrograms((p) => [...p, draft]);
                    setDraft("");
                  }}
                >
                  Add
                </Button>
              </div>
              <ul className="flex flex-col gap-1 text-xs font-mono text-muted-foreground">
                {programs.map((p) => (
                  <li key={p} className="truncate px-1">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
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
