"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { maskApiKey, readApiKey } from "@/lib/pay/api-key-store";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Show / copy the API key stored on this phone for `owner`. */
export function RevealApiKeyPanel({
  owner,
  onBack,
  extraAction,
}: {
  owner: string;
  onBack: () => void;
  extraAction?: { label: string; onClick: () => void | Promise<void> };
}) {
  const [visible, setVisible] = useState(false);
  const [extraBusy, setExtraBusy] = useState(false);
  const [apiKey, setApiKey] = useState(() => readApiKey(owner) ?? "");

  async function onCopy() {
    if (!apiKey) {
      toast.error("No API key on this phone.");
      return;
    }
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success("API key copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t copy API key"));
    }
  }

  async function onExtra() {
    if (!extraAction) return;
    try {
      setExtraBusy(true);
      await extraAction.onClick();
      setApiKey(readApiKey(owner) ?? "");
    } finally {
      setExtraBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <BackLink onClick={onBack} disabled={extraBusy} />
      <div className="space-y-1.5 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
          <KeyRound className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">API Key</p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Paste this on another phone to pay from that device.
        </p>
      </div>

      <div className="rounded-xl border border-border/50 bg-muted/25 px-4 py-3">
        <p className="break-all font-mono text-xs leading-relaxed text-foreground">
          {apiKey
            ? visible
              ? apiKey
              : maskApiKey(apiKey)
            : "No API key on this phone."}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onCopy()}
          disabled={!apiKey || extraBusy}
        >
          <Copy className="size-4" />
          Copy
        </Button>
        {extraAction ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full text-muted-foreground"
            onClick={() => void onExtra()}
            disabled={extraBusy}
          >
            {extraBusy ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Working…
              </>
            ) : (
              extraAction.label
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
