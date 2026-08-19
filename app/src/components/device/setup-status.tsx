"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Nfc } from "lucide-react";

import { DeviceWalletReady } from "@/components/device/wallet-ready";
import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { PasteApiKeyPanel } from "@/components/pay/paste-api-key-panel";
import { PayFlowPanel } from "@/components/pay/pay-flow-panel";
import { RevealApiKeyPanel } from "@/components/pay/reveal-api-key-panel";
import { usePaySetupSnapshot } from "@/hooks/pay/use-pay-setup-snapshot";
import { deviceFinishHref } from "@/lib/device/finish";
import { toUserErrorMessage } from "@/lib/user-errors";
import type { PhygitalAsset } from "@/lib/phygital/asset";

type View = "home" | "paste" | "reveal" | "pay";

/** Locked, owned device after NFC tap — Collect, Pay, and API-key actions. */
export function DeviceSetupStatus({ asset }: { asset: PhygitalAsset }) {
  const router = useRouter();
  const owner = asset.currentOwner.toString();
  const [view, setView] = useState<View>("home");
  const snap = usePaySetupSnapshot(owner);
  const limitHref = () =>
    router.push(deviceFinishHref({ intent: "limit", owner }));

  if (view === "paste") {
    return (
      <PasteApiKeyPanel
        expectedOwner={owner}
        replace={snap.apiKeyReady}
        onStored={() => setView("home")}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "reveal") {
    return (
      <RevealApiKeyPanel
        owner={owner}
        onBack={() => setView("home")}
        extraAction={{
          label: "Replace API key",
          onClick: () => setView("paste"),
        }}
      />
    );
  }

  if (view === "pay") {
    return (
      <PayFlowPanel
        owner={owner}
        variant="device"
        onSetLimit={limitHref}
        onManageApiKey={() => setView("reveal")}
        onBack={() => setView("home")}
      />
    );
  }

  if (snap.isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading device…</p>
      </CenteredStatus>
    );
  }

  if (snap.isError) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn't load device"
        body={toUserErrorMessage(
          snap.error,
          "Check your connection and try again.",
        )}
        destructive
      />
    );
  }

  return (
    <DeviceWalletReady
      owner={owner}
      capSet={snap.capSet}
      apiKeyReady={snap.apiKeyReady}
      onSetUpPay={!snap.capSet ? limitHref : undefined}
      onAddApiKey={snap.capSet ? () => setView("paste") : undefined}
      onPay={
        snap.capSet && snap.apiKeyReady ? () => setView("pay") : undefined
      }
    />
  );
}
