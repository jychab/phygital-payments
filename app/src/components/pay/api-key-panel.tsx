"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { ExpectedWalletConnect } from "@/components/shared/wallet-notices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProvisionApiKey } from "@/hooks/pay/use-provision-api-key";
import { markApiKeyVerified } from "@/hooks/pay/use-verified-api-key";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { verifyAndStoreApiKey } from "@/lib/pay/api-key-client";
import { maskApiKey, readApiKey } from "@/lib/pay/api-key-store";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Paste, reveal/copy, or wallet-sign issue/rotate — same panel on every route. */
export function ApiKeyPanel({
  owner,
  onStored,
  onBack,
  replace = false,
  onSkip,
}: {
  owner: string;
  onStored?: () => void;
  onBack?: () => void;
  replace?: boolean;
  onSkip?: () => void;
}) {
  const queryClient = useQueryClient();
  const { matched, ownerShort } = useExpectedWallet(owner);
  const { provisionKey } = useProvisionApiKey();
  const [pasteValue, setPasteValue] = useState("");
  const [storedKey, setStoredKey] = useState(
    () => readApiKey(owner) ?? "",
  );
  const [visible, setVisible] = useState(false);
  const [pasteBusy, setPasteBusy] = useState(false);
  const [provisionBusy, setProvisionBusy] = useState(false);

  const busy = pasteBusy || provisionBusy;
  const hasStoredKey = Boolean(storedKey);
  const rotate = replace || hasStoredKey;

  function refreshStoredKey() {
    setStoredKey(readApiKey(owner) ?? "");
    setVisible(false);
  }

  async function onSave() {
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      toast.error("Paste an API key first.");
      return;
    }
    try {
      setPasteBusy(true);
      await verifyAndStoreApiKey(owner, trimmed);
      markApiKeyVerified(queryClient, owner);
      refreshStoredKey();
      setPasteValue("");
      toast.success(
        rotate
          ? "API key updated on this phone"
          : "API key saved on this phone",
      );
      onStored?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t save API key"));
    } finally {
      setPasteBusy(false);
    }
  }

  async function onCopy() {
    if (!storedKey) {
      toast.error("No API key on this phone.");
      return;
    }
    try {
      await navigator.clipboard.writeText(storedKey);
      toast.success("API key copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t copy API key"));
    }
  }

  async function onProvision() {
    if (!matched) return;
    try {
      setProvisionBusy(true);
      await provisionKey(owner, { rotate });
      markApiKeyVerified(queryClient, owner);
      refreshStoredKey();
      toast.success(rotate ? "API key updated" : "API key saved on this phone");
      onStored?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t update API key"));
    } finally {
      setProvisionBusy(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? <BackLink onClick={onBack} disabled={busy} /> : null}
      <div className="space-y-1.5 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
          <KeyRound className="size-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Manage API Keys</p>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          Paste a key from another phone, or issue one with this wallet.
          Rotating issues a new key and stops older ones.
        </p>
      </div>

      {hasStoredKey ? (
        <div className="rounded-xl border border-border/50 bg-muted/25 px-4 py-3">
          <div className="mb-2 flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={visible ? "Hide API key" : "Show API key"}
              onClick={() => setVisible((value) => !value)}
              disabled={busy}
            >
              {visible ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Copy API key"
              onClick={() => void onCopy()}
              disabled={busy}
            >
              <Copy />
            </Button>
          </div>
          <p className="break-all font-mono text-xs leading-relaxed text-foreground">
            {visible ? storedKey : maskApiKey(storedKey)}
          </p>
        </div>
      ) : null}

      <Input
        id="paste-api-key"
        type="text"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="done"
        placeholder="Paste API key"
        value={pasteValue}
        onChange={(e) => setPasteValue(e.target.value)}
        disabled={busy}
        className="font-mono"
      />

      <div className="mt-auto flex flex-col gap-2.5">
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void onSave()}
          disabled={busy || !pasteValue.trim()}
        >
          {pasteBusy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Checking key…
            </>
          ) : rotate ? (
            "Replace API key"
          ) : (
            "Save API key"
          )}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border/60" />
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            or
          </span>
          <span className="h-px flex-1 bg-border/60" />
        </div>

        <ProvisionAction
          owner={owner}
          matched={matched}
          ownerShort={ownerShort}
          rotate={rotate}
          busy={busy}
          provisionBusy={provisionBusy}
          onProvision={() => void onProvision()}
        />

        {onSkip ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="w-full"
            onClick={onSkip}
            disabled={busy}
          >
            Not Now
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ProvisionAction({
  owner,
  matched,
  ownerShort,
  rotate,
  busy,
  provisionBusy,
  onProvision,
}: {
  owner: string;
  matched: boolean;
  ownerShort: string;
  rotate: boolean;
  busy: boolean;
  provisionBusy: boolean;
  onProvision: () => void;
}) {
  if (!matched) {
    return (
      <ExpectedWalletConnect
        owner={owner}
        disabled={busy}
        hint={`Connect ${ownerShort} to ${rotate ? "rotate this key" : "issue a key"}.`}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={onProvision}
      disabled={busy}
    >
      {provisionBusy ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          {rotate ? "Rotating…" : "Issuing…"}
        </>
      ) : rotate ? (
        "Rotate API key"
      ) : (
        "Issue API key"
      )}
    </Button>
  );
}
