"use client";

import { Wallet } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";

export function AccessoryWalletPanel() {
  return (
    <GateMessage
      icon={<Wallet className="size-5 text-muted-foreground" />}
      title="Your wallet"
      body="Wallet UI is coming next."
    />
  );
}
