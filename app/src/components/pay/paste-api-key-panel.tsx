"use client";

import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markApiKeyVerified } from "@/hooks/pay/use-verified-api-key";
import { verifyAndStoreApiKey } from "@/lib/pay/api-key-client";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Paste a raw API key for this wallet (localStorage). */
export function PasteApiKeyPanel({
  expectedOwner,
  onStored,
  onBack,
  replace = false,
}: {
  expectedOwner: string;
  onStored: () => void;
  onBack?: () => void;
  replace?: boolean;
}) {
  const [apiKey, setApiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();

  async function onSave() {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      toast.error("Paste an API key first.");
      return;
    }
    try {
      setBusy(true);
      await verifyAndStoreApiKey(expectedOwner, trimmed);
      markApiKeyVerified(queryClient, expectedOwner);
      toast.success(
        replace ? "API key updated on this phone" : "API key saved on this phone",
      );
      onStored();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t save API key"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? <BackLink onClick={onBack} disabled={busy} /> : null}
      <div className="space-y-1.5 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
          <KeyRound className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">
          {replace ? "Replace API Key" : "Add API Key"}
        </p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          {replace
            ? "Paste a new API key to replace the one stored on this phone."
            : "Paste the API key from the phone where you turned on Pay."}
        </p>
      </div>

      <Input
        id="paste-api-key"
        type="text"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder="Paste API key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        disabled={busy}
        className="font-mono"
      />

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onSave()}
          disabled={busy || !apiKey.trim()}
        >
          {busy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Checking key…
            </>
          ) : replace ? (
            "Replace API key"
          ) : (
            "Save API key"
          )}
        </Button>
      </div>
    </div>
  );
}
