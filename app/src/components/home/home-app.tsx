"use client";

import { useState } from "react";
import { History, LoaderCircle, Nfc, Wallet } from "lucide-react";

import { AppCard, AppShell, homeCollectModeNav } from "@/components/layout/app-shell";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { DevicesPanel } from "@/components/home/devices-panel";
import { HistoryPanel } from "@/components/home/history-panel";
import { PayScreen } from "@/components/pay/pay-screen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { useSolanaAddress } from "@/hooks/wallet/use-solana-address";

type HomeTab = "pay" | "devices" | "history";

/**
 * Route `/` — Pay, Devices, and Activity tabs (Privy).
 * NFC devices and first-time setup start by tapping a tag (opens `/device`).
 */
export function HomeApp() {
  const embedded = useIsEmbedded();
  const { address, isConnected, ready } = useSolanaAddress();
  const [tab, setTab] = useState<HomeTab>("pay");

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    return (
      <EmbedError
        title="This page isn’t for embeds"
        body="Use a Collect payment link with ?recipient= instead."
      />
    );
  }

  return (
    <AppShell modeLabel="Home" modeNav={homeCollectModeNav(address)}>
      {!ready ? (
        <AppCard>
          <CenteredStatus>
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </CenteredStatus>
        </AppCard>
      ) : !isConnected || !address ? (
        <AppCard>
          <GateMessage
            icon={<Wallet className="size-5 text-muted-foreground" />}
            title="Connect your wallet"
            body="Connect to pay, see your devices, and review activity."
          />
        </AppCard>
      ) : (
        <Tabs
          value={tab}
          onValueChange={(value) => {
            if (value === "pay" || value === "devices" || value === "history") {
              setTab(value);
            }
          }}
          className="flex flex-1 flex-col gap-0 motion-safe:animate-[wallet-rise_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
        >
          <TabsList className="grid h-11 w-full grid-cols-3 rounded-2xl bg-muted/50 p-1">
            <TabsTrigger
              value="pay"
              className="h-full gap-1.5 rounded-xl text-[0.8125rem] data-active:shadow-[0_1px_2px_oklch(0_0_0/0.25)]"
            >
              <Wallet className="size-3.5 opacity-70" />
              Pay
            </TabsTrigger>
            <TabsTrigger
              value="devices"
              className="h-full gap-1.5 rounded-xl text-[0.8125rem] data-active:shadow-[0_1px_2px_oklch(0_0_0/0.25)]"
            >
              <Nfc className="size-3.5 opacity-70" />
              Devices
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="h-full gap-1.5 rounded-xl text-[0.8125rem] data-active:shadow-[0_1px_2px_oklch(0_0_0/0.25)]"
            >
              <History className="size-3.5 opacity-70" />
              Activity
            </TabsTrigger>
          </TabsList>

          <AppCard>
            <TabsContent
              value="pay"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <PayScreen owner={address} active={tab === "pay"} />
            </TabsContent>
            <TabsContent
              value="devices"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <DevicesPanel owner={address} />
            </TabsContent>
            <TabsContent
              value="history"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <HistoryPanel owner={address} />
            </TabsContent>
          </AppCard>
        </Tabs>
      )}
    </AppShell>
  );
}
