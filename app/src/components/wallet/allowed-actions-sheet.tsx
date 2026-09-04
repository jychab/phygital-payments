"use client";

import { useEffect, useState } from "react";

import { NavBar } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { usePolicyEditor } from "@/hooks/wallet/use-wallet-policy";
import { copy } from "@/lib/copy/phygital";
import { DEFAULT_ALLOWED_PROGRAMS } from "@/lib/wallet/policies-client";

function isDefaultProgramList(list: string[]): boolean {
  return (
    list.length === DEFAULT_ALLOWED_PROGRAMS.length &&
    DEFAULT_ALLOWED_PROGRAMS.every((p) => list.includes(p))
  );
}

/** Payments-only vs custom program allowlist. */
export function AllowedActionsSheet({
  phygitalTokenPda,
  onBack,
}: {
  phygitalTokenPda: string;
  onBack: () => void;
}) {
  const editor = usePolicyEditor(phygitalTokenPda);
  const [preset, setPreset] = useState<"payments" | "custom">("payments");
  const [programs, setPrograms] = useState<string[]>([
    ...DEFAULT_ALLOWED_PROGRAMS,
  ]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!editor.policy.data) return;
    const list = editor.policy.data.allowedPrograms;
    const isDefault = isDefaultProgramList(list);
    setPreset(isDefault ? "payments" : "custom");
    setPrograms(list.length ? list : [...DEFAULT_ALLOWED_PROGRAMS]);
  }, [editor.policy.data]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            {copy.common.back}
          </Button>
        }
        title={copy.wallet.allowedActions}
      />
      {editor.loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {copy.wallet.policyDefaultSigningOnly}
          </p>
          <Button
            type="button"
            variant={preset === "payments" ? "default" : "outline"}
            onClick={() => {
              setPreset("payments");
              setPrograms([...DEFAULT_ALLOWED_PROGRAMS]);
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
                  placeholder={copy.wallet.programId}
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
                  {copy.wallet.add}
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
            disabled={editor.saving}
            onClick={() =>
              void editor.save(
                {
                  allowedPrograms:
                    preset === "payments"
                      ? [...DEFAULT_ALLOWED_PROGRAMS]
                      : programs,
                },
                onBack,
              )
            }
          >
            {editor.saving ? (
              <Spinner className="size-4" />
            ) : (
              copy.wallet.holdToSave
            )}
          </Button>
        </>
      )}
    </div>
  );
}
