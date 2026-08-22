"use client";

import { CircleAlert } from "lucide-react";

import { AccessoryWalletPanel } from "@/components/accessory/accessory-wallet-panel";
import { ClaimPanel } from "@/components/accessory/claim-panel";
import { OwnedByOtherPanel } from "@/components/accessory/owned-by-other-panel";
import { CheckingStatus, GateMessage } from "@/components/layout/gate-message";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { accessoryHomeView } from "@/lib/accessory/home-view";
import type { PhygitalToken } from "@/lib/phygital/token";

export function AccessoryHome({ token }: { token: PhygitalToken }) {
  const { session } = useSmartWallet();

  if (!session) {
    return <CheckingStatus />;
  }

  const view = accessoryHomeView(token, session.vaultPda);

  if (view === "claim") {
    return <ClaimPanel token={token} unclaimed />;
  }

  if (view === "foreign-owner") {
    return <OwnedByOtherPanel owner={String(token.currentOwner)} />;
  }

  if (view === "wallet") {
    return <AccessoryWalletPanel />;
  }

  return (
    <GateMessage
      icon={<CircleAlert className="size-5 text-muted-foreground" />}
      title="Not a wallet accessory"
      body="This accessory isn’t set up for this app."
    />
  );
}
