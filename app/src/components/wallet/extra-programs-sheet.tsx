"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { NavBar, NavBarBack } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { usePolicyEditor } from "@/hooks/wallet/use-wallet-policy";
import { copy } from "@/lib/copy/phygital";
import { shortAddress } from "@/lib/utils";
import { tryParseAddress } from "@/lib/solana/address";

/** Extra program allowlist (`allowAll`) on top of the fixed standing policy. */
export function ExtraProgramsSheet({
  phygitalTokenPda,
  onBack,
}: {
  phygitalTokenPda: string;
  onBack: () => void;
}) {
  const editor = usePolicyEditor(phygitalTokenPda);
  const [programs, setPrograms] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!editor.settings) return;
    setPrograms([...editor.settings.extraPrograms]);
  }, [editor.settings]);

  function addProgram() {
    const raw = draft.trim();
    if (!raw) return;
    const parsed = tryParseAddress(raw);
    if (!parsed) {
      toast.error(copy.wallet.invalidProgramId);
      return;
    }
    const id = String(parsed);
    if (programs.includes(id)) return;
    setPrograms((p) => [...p, id]);
    setDraft("");
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <NavBar
        leading={<NavBarBack onClick={onBack} />}
        title={copy.wallet.extraPrograms}
      />
      {editor.loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {copy.wallet.extraProgramsHint}
          </p>
          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value.trim())}
              placeholder={copy.wallet.programId}
              className="font-mono text-sm"
            />
            <Button type="button" variant="secondary" onClick={addProgram}>
              {copy.wallet.add}
            </Button>
          </div>
          {programs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {copy.wallet.extraProgramsEmpty}
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {programs.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 rounded-xl bg-muted/25 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">
                    {shortAddress(p, 6)}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={copy.common.remove}
                    onClick={() =>
                      setPrograms((prev) => prev.filter((x) => x !== p))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            size="lg"
            className="mt-auto"
            disabled={editor.busy}
            onClick={() =>
              void editor.save({ extraPrograms: programs }, onBack)
            }
          >
            {editor.saving ? (
              <Spinner className="size-4" />
            ) : (
              copy.wallet.save
            )}
          </Button>
        </>
      )}
    </div>
  );
}
