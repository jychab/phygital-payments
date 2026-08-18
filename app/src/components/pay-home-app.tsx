"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  History,
  LoaderCircle,
  Lock,
  LockOpen,
  Nfc,
  Trash2,
  Wallet,
} from "lucide-react";
import { AssetType } from "phygital-token-sdk";

import { AppCard, AppShell, homeCollectModeNav } from "@/components/app-shell";
import { EmbedBoot, EmbedError } from "@/components/embed-error";
import { CenteredStatus, GateMessage } from "@/components/gate-message";
import { LimitPanel } from "@/components/pay/pay-limit-panel";
import { ManagePayPanel, PayPanel } from "@/components/pay/pay-panel";
import { HistoryPanel } from "@/components/history-panel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useRemoveOwnershipMutation,
  useSetLockStateMutation,
} from "@/hooks/use-asset-mutations";
import { useDelegateStatuses } from "@/hooks/use-delegate-status";
import { useIsEmbedded } from "@/hooks/use-is-embedded";
import { usePhygitalAssetsByOwner } from "@/hooks/use-phygital-assets-by-owner";
import { useTokenHoldings } from "@/hooks/use-verified-tokens";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { getDefaultMint } from "@/lib/payments/payment-token";
import type { PaymentTokenHolding } from "@/lib/payments/payment-token";
import { toUserErrorMessage } from "@/lib/payments/user-errors";
import { shortAddress } from "@/lib/utils";
import { useSolanaAddress } from "@/lib/wallet/use-solana-address";

type HomeTab = "pay" | "devices" | "history";

/**
 * Home — Connect wallet for Pay, Devices list, and Activity.
 * NFC devices and first-time setup start by tapping a tag (opens /device).
 */
export function PayHomeApp() {
  const embedded = useIsEmbedded();
  const { address, isConnected, ready } = useSolanaAddress();
  const [mode, setMode] = useState<HomeTab>("pay");

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
            body="Use Connect above to see your devices, activity, and Pay."
          />
        </AppCard>
      ) : (
        <Tabs
          value={mode}
          onValueChange={(value) => {
            if (value === "pay" || value === "devices" || value === "history") {
              setMode(value);
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
              <HomePayTab owner={address} />
            </TabsContent>
            <TabsContent
              value="devices"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <OwnedAssetsList owner={address} />
            </TabsContent>
            <TabsContent
              value="history"
              className="mt-0 flex flex-1 flex-col outline-none data-[state=inactive]:hidden"
            >
              <HistoryPanel recipient={address} />
            </TabsContent>
          </AppCard>
        </Tabs>
      )}
    </AppShell>
  );
}

function HomePayTab({ owner }: { owner: string }) {
  const holdings = useTokenHoldings(owner);
  const holdingsReady = holdings.isSuccess || holdings.isError;
  const mints =
    holdings.data && holdings.data.length > 0
      ? holdings.data.map((h) => h.mint)
      : [String(getDefaultMint())];
  const statuses = useDelegateStatuses(
    holdingsReady ? owner : null,
    mints,
  );
  const assetsQuery = usePhygitalAssetsByOwner(owner);
  const [editHolding, setEditHolding] = useState<PaymentTokenHolding | null>(
    null,
  );
  const [manageOpen, setManageOpen] = useState(false);

  const hasAnyLimit = statuses.enabledMints.length > 0;
  const deviceCount = assetsQuery.data?.length ?? 0;
  const setupReady = hasAnyLimit && deviceCount > 0;
  const loading =
    holdings.isLoading ||
    !holdingsReady ||
    (mints.length > 0 && statuses.isLoading) ||
    statuses.isPending ||
    assetsQuery.isPending;

  if (loading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading Pay…</p>
      </CenteredStatus>
    );
  }

  if (editHolding) {
    return (
      <LimitPanel
        expectedOwner={owner}
        mint={editHolding.mint}
        onEnabled={() => setEditHolding(null)}
        onBack={() => setEditHolding(null)}
      />
    );
  }

  if (manageOpen) {
    return (
      <ManagePayPanel
        owner={owner}
        onBack={() => setManageOpen(false)}
        onEditTokenLimit={(holding) => setEditHolding(holding)}
      />
    );
  }

  if (!setupReady) {
    const hasDevices = deviceCount > 0;
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title={hasDevices ? "Pay is off." : "No NFC devices yet"}
        body={
          hasDevices
            ? "Set Up Pay when you're ready — hold your NFC device to this phone, or set a spending limit here."
            : "Hold an NFC device to this phone to add it. The tag opens a claim page."
        }
      />
    );
  }

  return (
    <PayPanel onManage={() => setManageOpen(true)} />
  );
}

function OwnedAssetsList({ owner }: { owner: string }) {
  const assetsQuery = usePhygitalAssetsByOwner(owner);
  const setLock = useSetLockStateMutation(owner);
  const removeOwnership = useRemoveOwnershipMutation(owner);

  if (assetsQuery.isPending) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your devices…</p>
      </CenteredStatus>
    );
  }

  if (assetsQuery.isError) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn’t load devices"
        body={toUserErrorMessage(
          assetsQuery.error,
          "Check your connection and try again.",
        )}
        destructive
      />
    );
  }

  const assets = assetsQuery.data ?? [];

  if (assets.length === 0) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-muted-foreground" />}
        title="No NFC devices yet"
        body="Hold an NFC device to this phone to add it. The tag opens a claim page — there’s nothing to tap here."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Your NFC devices</p>
        <p className="text-sm text-muted-foreground">
          Lock a device before paying. Remove returns it so someone else can
          claim it. Hold a tag to this phone to add another.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {assets.map((asset) => (
          <li key={asset.asset}>
            <AssetRow
              asset={asset}
              setLock={setLock}
              removeOwnership={removeOwnership}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

type LockMutation = ReturnType<typeof useSetLockStateMutation>;
type RemoveMutation = ReturnType<typeof useRemoveOwnershipMutation>;

function AssetRow({
  asset,
  setLock,
  removeOwnership,
}: {
  asset: PhygitalAsset;
  setLock: LockMutation;
  removeOwnership: RemoveMutation;
}) {
  const lockingThis =
    setLock.isPending && setLock.variables?.asset === asset.asset;
  const removingThis =
    removeOwnership.isPending &&
    removeOwnership.variables?.asset === asset.asset;
  const busy = lockingThis || removingThis;
  const canToggleLock = asset.assetType === AssetType.Lockable;

  async function onToggleLock() {
    try {
      await setLock.mutateAsync({
        asset: asset.asset,
        isLocked: !asset.isLocked,
      });
      toast.success(asset.isLocked ? "Device unlocked" : "Device locked");
    } catch (error) {
      toast.error(
        toUserErrorMessage(
          error,
          asset.isLocked
            ? "Couldn’t unlock this device"
            : "Couldn’t lock this device",
        ),
      );
    }
  }

  async function onRemoveOwnership() {
    const confirmed = window.confirm(
      "Remove this NFC device from your wallet? It will be unlocked and anyone can claim it again.",
    );
    if (!confirmed) return;
    try {
      await removeOwnership.mutateAsync({ asset: asset.asset });
      toast.success("Device removed from this wallet");
    } catch (error) {
      toast.error(
        toUserErrorMessage(error, "Couldn’t remove this device"),
      );
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card/60">
          <Nfc className="size-4 text-muted-foreground" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">
            {shortAddress(asset.secp256r1PublicKey, 6)}
          </span>
          <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
            {asset.isLocked ? (
              <>
                <Lock className="size-3" />
                Locked
              </>
            ) : (
              <>
                <LockOpen className="size-3" />
                Unlocked
              </>
            )}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {canToggleLock ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || setLock.isPending || removeOwnership.isPending}
            onClick={() => void onToggleLock()}
          >
            {lockingThis ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : asset.isLocked ? (
              <LockOpen className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
            {asset.isLocked ? "Unlock" : "Lock"}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={busy || setLock.isPending || removeOwnership.isPending}
          onClick={() => void onRemoveOwnership()}
        >
          {removingThis ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
          Remove
        </Button>
      </div>
    </div>
  );
}
