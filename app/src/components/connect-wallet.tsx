"use client";

import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/wallet/wallet-context";
import { cn } from "@/lib/utils";

function shortAddress(value: string, length = 4): string {
  return `${value.slice(0, length)}…${value.slice(-length)}`;
}

export function ConnectWallet({ className }: { className?: string }) {
  const { ready, login, logout, address, isConnected } = useWallet();

  if (!ready) {
    return (
      <Button disabled variant="outline" size="sm" className={className}>
        <Wallet className="size-3.5" />
        …
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-2 font-mono text-xs", className)}
        onClick={logout}
        title="Disconnect"
      >
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        {shortAddress(address)}
      </Button>
    );
  }

  return (
    <Button onClick={login} size="sm" className={className}>
      <Wallet className="size-3.5" />
      Connect
    </Button>
  );
}
