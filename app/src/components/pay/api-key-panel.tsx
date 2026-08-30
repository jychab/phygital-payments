"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { StickyActions } from "@/components/shared/sticky-actions";
import { ExpectedWalletConnect } from "@/components/shared/wallet-notices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProvisionApiKey } from "@/hooks/pay/use-provision-api-key";
import { markApiKeyVerified } from "@/hooks/pay/use-verified-api-key";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { verifyAndStoreApiKey } from "@/lib/pay/api-key-client";
import { maskApiKey, readApiKey } from "@/lib/pay/api-key-store";
import { payCopy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";

type PanelStep = "home" | "paste" | "confirm-reset";

/** Generate, import, or rotate the Revibase Pay API key in this browser. */
export function ApiKeyPanel({
  owner,
  onStored,
  onBack,
  onSkip,
}: {
  owner: string;
  onStored?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}) {
  const queryClient = useQueryClient();
  const { matched, ownerShort } = useExpectedWallet(owner);
  const { provisionKey } = useProvisionApiKey();
  const [step, setStep] = useState<PanelStep>("home");
  const [pasteValue, setPasteValue] = useState("");
  const [storedKey, setStoredKey] = useState(
    () => readApiKey(owner) ?? "",
  );
  const [visible, setVisible] = useState(false);
  const [pasteBusy, setPasteBusy] = useState(false);
  const [provisionBusy, setProvisionBusy] = useState(false);

  const busy = pasteBusy || provisionBusy;
  const hasStoredKey = Boolean(storedKey);
  const canGoBack = Boolean(onBack) || step !== "home";

  function goHome() {
    setStep("home");
    setPasteValue("");
  }

  function refreshStoredKey() {
    setStoredKey(readApiKey(owner) ?? "");
    setVisible(false);
  }

  async function onSave() {
    const trimmed = pasteValue.trim();
    if (!trimmed) {
      toast.error("Paste it first.");
      return;
    }
    try {
      setPasteBusy(true);
      await verifyAndStoreApiKey(owner, trimmed);
      markApiKeyVerified(queryClient, owner);
      refreshStoredKey();
      setPasteValue("");
      goHome();
      toast.success(payCopy.onToast);
      onStored?.();
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t continue"));
    } finally {
      setPasteBusy(false);
    }
  }

  async function onCopy() {
    if (!storedKey) {
      toast.error("Pay isn’t on here.");
      return;
    }
    try {
      await navigator.clipboard.writeText(storedKey);
      toast.success("Copied");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t copy"));
    }
  }

  async function onProvision(rotate: boolean) {
    if (!matched) return;
    try {
      setProvisionBusy(true);
      await provisionKey(owner, { rotate });
      markApiKeyVerified(queryClient, owner);
      refreshStoredKey();
      goHome();
      toast.success(
        rotate ? "Other browsers will stop working." : payCopy.onToast,
      );
    } catch (error) {
      toast.error(
        toUserErrorMessage(
          error,
          rotate ? "Couldn’t start over" : "Couldn’t turn on Pay",
        ),
      );
    } finally {
      setProvisionBusy(false);
    }
  }

  const copy = copyForStep(step, hasStoredKey);

  return (
    <div className="flex flex-1 flex-col gap-6">
      {canGoBack ? (
        <BackLink
          onClick={() => {
            if (step !== "home") goHome();
            else onBack?.();
          }}
          disabled={busy}
        />
      ) : null}

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          {copy.title}
        </h1>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          {copy.subtitle}
        </p>
      </div>

      {step === "home" && hasStoredKey ? (
        <StoredKeyCard
          storedKey={storedKey}
          visible={visible}
          busy={busy}
          onToggleVisible={() => setVisible((value) => !value)}
          onCopy={() => void onCopy()}
        />
      ) : null}

      {step === "paste" ? (
        <Input
          id="paste-api-key"
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
      ) : null}

      <StickyActions>
        {step === "home" && !hasStoredKey ? (
          <>
            <ProvisionAction
              owner={owner}
              matched={matched}
              busy={busy}
              provisionBusy={provisionBusy}
              idleLabel={payCopy.generateKey}
              busyLabel="Generating…"
              connectHint={`Connect ${ownerShort} to generate an API key.`}
              onProvision={() => void onProvision(false)}
            />
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setStep("paste")}
              disabled={busy}
            >
              {payCopy.importKey}
            </Button>
          </>
        ) : null}

        {step === "home" && hasStoredKey ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setStep("paste")}
              disabled={busy}
            >
              {payCopy.importKey}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full text-muted-foreground"
              onClick={() => setStep("confirm-reset")}
              disabled={busy}
            >
              {payCopy.rotateKey}
            </Button>
          </>
        ) : null}

        {step === "paste" ? (
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
                Checking…
              </>
            ) : (
              "Continue"
            )}
          </Button>
        ) : null}

        {step === "confirm-reset" ? (
          <ProvisionAction
            owner={owner}
            matched={matched}
            busy={busy}
            provisionBusy={provisionBusy}
            idleLabel={payCopy.rotateKey}
            busyLabel="Rotating…"
            connectHint={`Connect ${ownerShort} to rotate the API key.`}
            onProvision={() => void onProvision(true)}
          />
        ) : null}

        {onSkip && step === "home" && !hasStoredKey ? (
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
      </StickyActions>
    </div>
  );
}

function copyForStep(step: PanelStep, hasStoredKey: boolean): {
  title: string;
  subtitle: string;
} {
  if (step === "paste") {
    return {
      title: payCopy.importKey,
      subtitle: "Paste a key from another browser.",
    };
  }
  if (step === "confirm-reset") {
    return {
      title: `${payCopy.rotateKey}?`,
      subtitle:
        "Other browsers will stop working. This browser stays on.",
    };
  }
  if (hasStoredKey) {
    return {
      title: "API key",
      subtitle: `Copy this to use ${payCopy.product} in another browser.`,
    };
  }
  return {
    title: payCopy.enableTitle,
    subtitle: payCopy.enableSubtitle,
  };
}

function StoredKeyCard({
  storedKey,
  visible,
  busy,
  onToggleVisible,
  onCopy,
}: {
  storedKey: string;
  visible: boolean;
  busy: boolean;
  onToggleVisible: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/25 px-4 py-3">
      <div className="mb-2 flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={visible ? "Hide" : "Show"}
          onClick={onToggleVisible}
          disabled={busy}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Copy"
          onClick={onCopy}
          disabled={busy}
        >
          <Copy />
        </Button>
      </div>
      <p className="break-all font-mono text-xs leading-relaxed text-foreground">
        {visible ? storedKey : maskApiKey(storedKey)}
      </p>
    </div>
  );
}

function ProvisionAction({
  owner,
  matched,
  busy,
  provisionBusy,
  idleLabel,
  busyLabel,
  connectHint,
  onProvision,
}: {
  owner: string;
  matched: boolean;
  busy: boolean;
  provisionBusy: boolean;
  idleLabel: string;
  busyLabel: string;
  connectHint: string;
  onProvision: () => void;
}) {
  if (!matched) {
    return (
      <ExpectedWalletConnect
        owner={owner}
        disabled={busy}
        hint={connectHint}
      />
    );
  }

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      onClick={onProvision}
      disabled={busy}
    >
      {provisionBusy ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          {busyLabel}
        </>
      ) : (
        idleLabel
      )}
    </Button>
  );
}
