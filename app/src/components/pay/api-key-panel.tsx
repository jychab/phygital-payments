"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { BackLink } from "@/components/shared/back-link";
import { StickyActions } from "@/components/shared/sticky-actions";
import { ExpectedWalletConnect } from "@/components/shared/wallet-notices";
import { Button } from "@/components/ui/button";
import { useProvisionApiKey } from "@/hooks/pay/use-provision-api-key";
import { markApiKeyVerified } from "@/lib/pay/mark-api-key-verified";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { maskApiKey, readApiKey } from "@/lib/pay/api-key-store";
import { copy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";

type PanelStep = "home" | "confirm-reset";

/** Issue or rotate this phone’s Pay key — no import or paste. */
export function ApiKeyPanel({
  owner,
  onStored,
  onBack,
}: {
  owner: string;
  onStored?: () => void;
  onBack?: () => void;
}) {
  const queryClient = useQueryClient();
  const { matched, ownerShort } = useExpectedWallet(owner);
  const { provisionKey } = useProvisionApiKey();
  const [step, setStep] = useState<PanelStep>("home");
  const [storedKey, setStoredKey] = useState(
    () => readApiKey(owner) ?? "",
  );
  const [visible, setVisible] = useState(false);
  const [provisionBusy, setProvisionBusy] = useState(false);

  const busy = provisionBusy;
  const hasStoredKey = Boolean(storedKey);
  const canGoBack = Boolean(onBack) || step !== "home";

  function goHome() {
    setStep("home");
  }

  function refreshStoredKey() {
    setStoredKey(readApiKey(owner) ?? "");
    setVisible(false);
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
        rotate ? copy.pay.rotateSuccessToast : copy.pay.onToast,
      );
      onStored?.();
    } catch (error) {
      toast.error(
        toUserErrorMessage(
          error,
          rotate ? copy.pay.rotateFailed : copy.pay.authorizeFailed,
        ),
      );
    } finally {
      setProvisionBusy(false);
    }
  }

  const stepCopy = copyForStep(step, hasStoredKey);

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
          {stepCopy.title}
        </h1>
        <p className="mx-auto max-w-72 text-sm text-muted-foreground">
          {stepCopy.subtitle}
        </p>
      </div>

      {step === "home" && hasStoredKey ? (
        <StoredKeyCard
          storedKey={storedKey}
          visible={visible}
          busy={busy}
          onToggleVisible={() => setVisible((value) => !value)}
        />
      ) : null}

      <StickyActions>
        {step === "home" && !hasStoredKey ? (
          <ProvisionAction
            owner={owner}
            matched={matched}
            busy={busy}
            provisionBusy={provisionBusy}
            idleLabel={stepCopy.issueKey}
            busyLabel={copy.pay.authorizing}
            connectHint={copy.wallet.connectToAuthorize(ownerShort)}
            onProvision={() => void onProvision(false)}
          />
        ) : null}

        {step === "home" && hasStoredKey ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setStep("confirm-reset")}
            disabled={busy}
          >
            {stepCopy.rotateKey}
          </Button>
        ) : null}

        {step === "confirm-reset" ? (
          <ProvisionAction
            owner={owner}
            matched={matched}
            busy={busy}
            provisionBusy={provisionBusy}
            idleLabel={stepCopy.rotateKey}
            busyLabel={copy.pay.rotating}
            connectHint={copy.wallet.connectToRotate(ownerShort)}
            onProvision={() => void onProvision(true)}
          />
        ) : null}
      </StickyActions>
    </div>
  );
}

function copyForStep(step: PanelStep, hasStoredKey: boolean): {
  title: string;
  subtitle: string;
  issueKey: string;
  rotateKey: string;
} {
  if (step === "confirm-reset") {
    return {
      title: copy.pay.rotateTitle,
      subtitle: copy.pay.rotateSubtitle,
      issueKey: copy.pay.issueKey,
      rotateKey: copy.pay.rotateKey,
    };
  }
  if (hasStoredKey) {
    return {
      title: copy.pay.thisPhone,
      subtitle: copy.pay.phoneCanStartPay,
      issueKey: copy.pay.issueKey,
      rotateKey: copy.pay.rotateKey,
    };
  }
  return {
    title: copy.pay.authorizeTitle,
    subtitle: copy.pay.authorizeSubtitle,
    issueKey: copy.pay.issueKey,
    rotateKey: copy.pay.rotateKey,
  };
}

function StoredKeyCard({
  storedKey,
  visible,
  busy,
  onToggleVisible,
}: {
  storedKey: string;
  visible: boolean;
  busy: boolean;
  onToggleVisible: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/25 px-4 py-3">
      <div className="mb-2 flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={visible ? copy.common.hide : copy.common.show}
          onClick={onToggleVisible}
          disabled={busy}
        >
          {visible ? <EyeOff /> : <Eye />}
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
