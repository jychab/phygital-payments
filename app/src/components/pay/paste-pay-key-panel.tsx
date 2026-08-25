"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markApiKeyVerified } from "@/hooks/pay/use-verified-api-key";
import { verifyAndStoreApiKey } from "@/lib/pay/api-key-client";
import { toUserErrorMessage } from "@/lib/user-errors";

/**
 * Import an existing Pay API key — HTTP verify only, no wallet Connect.
 * Used when Confirm is on but this browser has no live key.
 */
export function PastePayKeyPanel({
  owner,
  onStored,
  onBack,
  onNeedWallet,
}: {
  owner: string;
  onStored?: () => void;
  onBack?: () => void;
  /** Escalate to Connect to generate a new key. */
  onNeedWallet?: () => void;
}) {
  const queryClient = useQueryClient();
  const [pasteValue, setPasteValue] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSave() {
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      toast.error("Paste it first.");
      return;
    }
    try {
      setBusy(true);
      await verifyAndStoreApiKey(owner, trimmed);
      markApiKeyVerified(queryClient, owner);
      toast.success("Revibase Pay is on");
      onStored?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t continue"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? <BackLink onClick={onBack} disabled={busy} /> : null}

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          Set up Revibase Pay
        </h1>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          Import a key from another browser, or generate a new one.
        </p>
      </div>

      <Input
        id="paste-pay-api-key"
        type="text"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder="Paste here"
        value={pasteValue}
        onChange={(e) => setPasteValue(e.target.value)}
        disabled={busy}
        className="font-mono"
      />

      <div className="mt-auto flex flex-col items-center gap-2.5">
        <div className="flex w-full max-w-xs flex-col gap-2.5">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void onSave()}
            disabled={busy || !pasteValue.trim()}
          >
            {busy ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Checking…
              </>
            ) : (
              "Continue"
            )}
          </Button>
          {onNeedWallet ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onNeedWallet}
              disabled={busy}
            >
              Generate API key
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
