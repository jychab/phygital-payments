"use client";

import { useIsRestoring } from "@tanstack/react-query";
import { toast } from "sonner";
import { LoaderCircle, Lock, LockOpen, Nfc, Trash2 } from "lucide-react";
import { PhygitalTokenType } from "phygital-token-sdk";

import { CenteredStatus, GateMessage } from "@/components/layout/gate-message";
import { DeviceIdentity } from "@/components/shared/device-identity";
import { QueryRefreshButton } from "@/components/shared/query-refresh-button";
import { Button } from "@/components/ui/button";
import {
  useRemoveOwnershipMutation,
  useSetLockStateMutation,
} from "@/hooks/home/use-token-mutations";
import { usePhygitalTokensByOwner } from "@/hooks/home/use-phygital-tokens-by-owner";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

/** Home → Devices tab: lock / unlock / remove NFC devices for this wallet. */
export function DevicesPanel({ owner }: { owner: string }) {
  const isRestoring = useIsRestoring();
  const tokensQuery = usePhygitalTokensByOwner(owner);
  const setLock = useSetLockStateMutation(owner);
  const removeOwnership = useRemoveOwnershipMutation(owner);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-medium text-foreground">Your devices</p>
      <QueryRefreshButton owner={owner} />
    </div>
  );

  if (isRestoring || tokensQuery.isLoading) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading your devices…</p>
      </CenteredStatus>
    );
  }

  if (tokensQuery.isError) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        {header}
        <GateMessage
          icon={<Nfc className="size-5 text-destructive" />}
          title="Couldn’t load devices"
          body={toUserErrorMessage(
            tokensQuery.error,
            "Check your connection and try again.",
          )}
          destructive
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => void tokensQuery.refetch()}
              disabled={tokensQuery.isFetching}
            >
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const tokens = tokensQuery.data ?? [];

  if (tokens.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-3">
        {header}
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title="No devices yet"
          body="Hold a device to the back of your phone to add it to this wallet."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      {header}
      <p className="text-sm text-muted-foreground">
        Lock a device to pay with it. Remove it if you want someone else to add it.
      </p>
      <ul className="flex flex-col gap-2">
        {tokens.map((token) => (
          <li key={token.address}>
            <TokenRow
              token={token}
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

function TokenRow({
  token,
  setLock,
  removeOwnership,
}: {
  token: PhygitalToken;
  setLock: LockMutation;
  removeOwnership: RemoveMutation;
}) {
  const lockingThis =
    setLock.isPending && setLock.variables?.token === token.address;
  const removingThis =
    removeOwnership.isPending &&
    removeOwnership.variables?.token === token.address;
  const busy = lockingThis || removingThis;
  const canToggleLock = token.tokenType === PhygitalTokenType.Controlled;

  async function onToggleLock() {
    try {
      await setLock.mutateAsync({
        token: token.address,
        isLocked: !token.isLocked,
      });
      toast.success(token.isLocked ? "Device unlocked" : "Device locked");
    } catch (error) {
      toast.error(
        toUserErrorMessage(
          error,
          token.isLocked
            ? "Couldn’t unlock this device"
            : "Couldn’t lock this device",
        ),
      );
    }
  }

  async function onRemoveOwnership() {
    const confirmed = window.confirm(
      "Remove this device from your wallet? Anyone will be able to add it.",
    );
    if (!confirmed) return;
    try {
      await removeOwnership.mutateAsync({ token: token.address });
      toast.success("Device removed");
    } catch (error) {
      toast.error(
        toUserErrorMessage(error, "Couldn’t remove this device"),
      );
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-muted/20 px-3.5 py-3">
      <DeviceIdentity token={token} />
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
            ) : token.isLocked ? (
              <LockOpen className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
            {token.isLocked ? "Unlock" : "Lock"}
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
