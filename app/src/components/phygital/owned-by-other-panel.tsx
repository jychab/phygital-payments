"use client";

import { Wallet } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { shortAddress } from "@/lib/utils";

export function OwnedByOtherPanel({ owner }: { owner: string }) {
  return (
    <GateMessage
      icon={<Wallet className="size-5 text-muted-foreground" />}
      title="Owned by another wallet"
      body={
        <>
          This phygital is linked to {shortAddress(owner)}.
          <span className="mt-2 block break-all font-mono text-[11px] leading-relaxed">
            {owner}
          </span>
        </>
      }
    />
  );
}
