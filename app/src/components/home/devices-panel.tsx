"use client";

import { useIsRestoring } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle, Lock, LockOpen, Nfc, Trash2 } from "lucide-react";
import { AssetType } from "phygital-token-sdk";

import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";
import {
  useRemoveOwnershipMutation,
  useSetLockStateMutation,
} from "@/hooks/home/use-asset-mutations";
import { usePhygitalAssetsByOwner } from "@/hooks/home/use-phygital-assets-by-owner";
import type { PhygitalAsset } from "@/lib/phygital/asset";
import { toUserErrorMessage } from "@/lib/user-errors";
import { shortAddress } from "@/lib/utils";

/** Home → Devices tab: lock / unlock / remove NFC devices for this wallet. */
export function DevicesPanel({ owner }: { owner: string }) {
  const isRestoring = useIsRestoring();
  const assetsQuery = usePhygitalAssetsByOwner(owner);
  const setLock = useSetLockStateMutation(owner);
  const removeOwnership = useRemoveOwnershipMutation(owner);

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
        body="Hold a device to this phone to add it. Nothing to tap on this screen."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Your NFC devices</p>
        <p className="text-sm text-muted-foreground">
          Lock a device to pay with it. Remove lets someone else claim it.
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
