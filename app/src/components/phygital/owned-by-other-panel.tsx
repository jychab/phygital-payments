"use client";

import { Wallet } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { shortAddress } from "@/lib/utils";

export function OwnedByOtherPanel({ owner }: { owner: string }) {
  return (
    <GateMessage
      icon={<Wallet className="size-5 text-muted-foreground" />}
      title="Linked to another wallet"
      body={`This accessory is linked to ${shortAddress(owner)}.`}
    />
  );
}
