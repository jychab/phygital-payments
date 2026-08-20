"use client";

import { useIsRestoring } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle, Lock, LockOpen, Nfc, Trash2 } from "lucide-react";
import { AssetType } from "phygital-token-sdk";

import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { DeviceIdentity } from "@/components/shared/device-identity";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import {
  useRemoveOwnershipMutation,
  useSetLockStateMutation,
} from "@/hooks/home/use-asset-mutations";
import { usePhygitalAssetsByOwner } from "@/hooks/home/use-phygital-assets-by-owner";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Home → Devices tab: lock / unlock / remove NFC devices for this wallet. */
export function DevicesPanel({ owner }: { owner: string }) {
  const isRestoring = useIsRestoring();
  const assetsQuery = usePhygitalAssetsByOwner(owner);
  const setLock = useSetLockStateMutation(owner);
  const removeOwnership = useRemoveOwnershipMutation(owner);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-medium text-foreground">Your NFC devices</p>
      <QueryRefreshButton owner={owner} />
    </div>
  );

  if (isRestoring || assetsQuery.isLoading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your devices…</p>
      </CenteredStatus>
    );
  }

  if (assetsQuery.isError) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        {header}
        <GateMessage
          icon={<Nfc className="size-5 text-destructive" />}
          title="Couldn’t load devices"
          body={toUserErrorMessage(
            assetsQuery.error,
            "Check your connection and try again.",
          )}
          destructive
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void assetsQuery.refetch()}
              disabled={assetsQuery.isFetching}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const assets = assetsQuery.data ?? [];

  if (assets.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        {header}
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title="No NFC devices yet"
          body="Hold a device, then claim it to this wallet. Nothing to tap on this screen."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {header}
      <p className="text-sm text-muted-foreground">
        Lock a device to pay with it. Remove lets someone else claim it.
      </p>
      <ul className="flex flex-col gap-2">
        {assets.map((asset) => (
          <li key={asset.address}>
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
    setLock.isPending && setLock.variables?.asset === asset.address;
  const removingThis =
    removeOwnership.isPending &&
    removeOwnership.variables?.asset === asset.address;
  const busy = lockingThis || removingThis;
  const canToggleLock = asset.assetType === AssetType.Lockable;

  async function onToggleLock() {
    try {
      await setLock.mutateAsync({
        asset: asset.address,
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
      await removeOwnership.mutateAsync({ asset: asset.address });
      toast.success("Device removed from this wallet");
    } catch (error) {
      toast.error(
        toUserErrorMessage(error, "Couldn’t remove this device"),
      );
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-3">
      <DeviceIdentity asset={asset} />
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
