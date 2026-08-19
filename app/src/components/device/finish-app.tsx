"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Wallet } from "lucide-react";

import { AppCard, AppShell } from "@/components/layout/app-shell";
import { FinishClaimPanel } from "@/components/device/finish-claim-panel";
import { DeviceFinishSetup } from "@/components/device/finish-setup";
import { GateMessage } from "@/components/layout/gate-message";
import { tryParseAddress } from "@/lib/solana/address";

/**
 * Route `/device/finish` — Privy wallet connect.
 * `?token=` finishes a claim; `?intent=limit|enable&owner=` continues Pay setup.
 */
export function DeviceFinishApp() {
  return (
    <AppShell walletActions="full" modeLabel="Device">
      <AppCard>
        <FinishDeviceRouter />
      </AppCard>
    </AppShell>
  );
}

function FinishDeviceRouter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token")?.trim() ?? "";
  const intent = searchParams.get("intent")?.trim();
  const owner = tryParseAddress(searchParams.get("owner")?.trim() ?? "");

  if (token) {
    return <FinishClaimPanel />;
  }

  if ((intent === "limit" || intent === "enable") && owner) {
    return (
      <DeviceFinishSetup
        owner={String(owner)}
        onDismiss={() => router.push("/")}
      />
    );
  }

  return (
    <GateMessage
      icon={<Wallet className="size-5 text-destructive" />}
      title="Can't finish"
      body="Missing finish link. Tap your NFC device again."
      destructive
    />
  );
}
