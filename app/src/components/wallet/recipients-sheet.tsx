"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Nfc, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePolicyEditor } from "@/hooks/wallet/use-wallet-policy";
import { copy } from "@/lib/copy/phygital";
import { identifyAccessory } from "@/lib/wallet/identify-accessory";
import { shortAddress } from "@/lib/utils";
import { tryParseAddress } from "@/lib/solana/address";
import { toUserErrorMessage } from "@/lib/user-errors";

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
  const [denylist, setDenylist] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [denyDraft, setDenyDraft] = useState("");

  useEffect(() => {
    if (!editor.policy.data) return;
    setMode(editor.policy.data.recipientMode);
    setAllowlist(editor.policy.data.recipientAllowlist);
    setDenylist(editor.policy.data.recipientDenylist);
  }, [editor.policy.data]);

  function addAddress(raw: string, target: "allow" | "deny") {
    const parsed = tryParseAddress(raw.trim());
    if (!parsed) {
      toast.error(copy.wallet.invalidAddress);
      return;
    }
    const next = String(parsed);
    if (target === "allow") {
      if (allowlist.includes(next)) return;
      setAllowlist((prev) => [...prev, next]);
      setDraft("");
    } else {
      if (denylist.includes(next)) return;
      setDenylist((prev) => [...prev, next]);
      setDenyDraft("");
    }
  }

  async function pickNfc(target: "allow" | "deny") {
    try {
      const id = await identifyAccessory();
      addAddress(String(id.walletPda), target);
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    }
  }

  async function save() {
    await editor.save(
      {
        recipientMode: mode,
        recipientAllowlist: mode === "allowlist" ? allowlist : [],
        recipientDenylist: denylist,
      },
      onBack,
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {copy.common.back}
        </Button>
        <p className="text-sm font-medium">{copy.wallet.recipients}</p>
        <span className="w-16" aria-hidden />
      </div>
      {editor.loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {copy.common.loading}
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {copy.wallet.policyDefaultSigningOnly}
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
                  onClick={() => void pickNfc("allow")}
                >
                  <Nfc className="size-4" />
                </Button>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => addAddress(draft, "allow")}
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
                    <button
                      type="button"
                      aria-label={copy.common.remove}
                      onClick={() =>
                        setAllowlist((prev) => prev.filter((a) => a !== addr))
                      }
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              {copy.wallet.recipientsBlocked}
            </p>
            <div className="flex gap-2">
              <Input
                value={denyDraft}
                onChange={(e) => setDenyDraft(e.target.value)}
                placeholder={copy.wallet.pasteAddress}
                className="flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={copy.wallet.tapAccessory}
                onClick={() => void pickNfc("deny")}
              >
                <Nfc className="size-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => addAddress(denyDraft, "deny")}
            >
              {copy.wallet.block}
            </Button>
            <ul className="flex flex-col gap-1">
              {denylist.map((addr) => (
                <li
                  key={addr}
                  className="flex items-center justify-between rounded-xl bg-muted/25 px-3 py-2 text-sm"
                >
                  <span className="font-mono">{shortAddress(addr, 6)}</span>
                  <button
                    type="button"
                    aria-label={copy.common.remove}
                    onClick={() =>
                      setDenylist((prev) => prev.filter((a) => a !== addr))
                    }
                  >
                    <Trash2 className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Button
            type="button"
            size="lg"
            className="mt-auto"
            disabled={editor.saving}
            onClick={() => void save()}
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
