"use client";

import type { ReactNode } from "react";
import { Wallet } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";

/** Full-width connect prompt — same pattern on Home, Collect, and claim. */
export function ConnectGate({
  title = "Connect your wallet",
  body = copy.connectCollectionBody,
  onConnect,
  icon,
}: {
  title?: string;
  body?: string;
  onConnect: () => void;
  icon?: ReactNode;
}) {
  return (
    <GateMessage
      icon={icon ?? <Wallet className="size-5 text-muted-foreground" />}
      title={title}
      body={body}
      action={
        <Button type="button" size="lg" className="w-full" onClick={onConnect}>
          {copy.connectWallet}
        </Button>
      }
    />
  );
}
