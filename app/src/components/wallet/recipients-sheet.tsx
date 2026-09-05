"use client";

import { useEffect, useState } from "react";
import { Nfc, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { NavBar, NavBarBack } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePolicyEditor } from "@/hooks/wallet/use-wallet-policy";
import { copy } from "@/lib/copy/phygital";
import { identifyAccessory } from "@/lib/wallet/identify-accessory";
import { shortAddress } from "@/lib/utils";
import { tryParseAddress } from "@/lib/solana/address";
import { toUserErrorMessage } from "@/lib/user-errors";
import { Spinner } from "@/components/ui/spinner";

/** Anyone vs allowlist recipients. */
export function RecipientsSheet({
  phygitalTokenPda,
  onBack,
}: {
  phygitalTokenPda: string;
  onBack: () => void;
}) {
  const editor = usePolicyEditor(phygitalTokenPda);
  const [mode, setMode] = useState<"anyone" | "allowlist">("anyone");
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!editor.settings) return;
    setMode(editor.settings.recipientMode);
    setAllowlist(editor.settings.recipientAllowlist);
  }, [editor.settings]);

  function addAddress(raw: string) {
    const parsed = tryParseAddress(raw.trim());
    if (!parsed) {
      toast.error(copy.wallet.invalidAddress);
      return;
    }
    const next = String(parsed);
    if (allowlist.includes(next)) return;
    setAllowlist((prev) => [...prev, next]);
    setDraft("");
  }

  async function pickNfc() {
    try {
      const id = await identifyAccessory();
      addAddress(String(id.walletPda));
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    }
  }

  async function save() {
    await editor.save(
      {
        recipientMode: mode,
        recipientAllowlist: mode === "allowlist" ? allowlist : [],
      },
      onBack,
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <NavBar
        leading={<NavBarBack onClick={onBack} />}
        title={copy.wallet.recipients}
      />
      {editor.loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {copy.wallet.recipientsHint}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "anyone" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("anyone")}
            >
              {copy.wallet.recipientsAnyone}
            </Button>
            <Button
              type="button"
              variant={mode === "allowlist" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setMode("allowlist")}
            >
              {copy.wallet.recipientsAllowlist}
            </Button>
          </div>
          {mode === "allowlist" ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={copy.wallet.pasteAddress}
                  className="flex-1 font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={copy.wallet.tapAccessory}
                  onClick={() => void pickNfc()}
                >
                  <Nfc className="size-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addAddress(draft)}
              >
                {copy.wallet.add}
              </Button>
              <ul className="flex flex-col gap-1">
                {allowlist.map((addr) => (
                  <li
                    key={addr}
                    className="flex items-center justify-between rounded-xl bg-muted/25 px-3 py-2 text-sm"
                  >
                    <span className="font-mono">{shortAddress(addr, 6)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={copy.common.remove}
                      onClick={() =>
                        setAllowlist((prev) => prev.filter((a) => a !== addr))
                      }
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <Button
            type="button"
            size="lg"
            className="mt-auto"
            disabled={editor.busy}
            onClick={() => void save()}
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
