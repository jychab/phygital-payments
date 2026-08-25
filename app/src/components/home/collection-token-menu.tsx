"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  LoaderCircle,
  Lock,
  LockOpen,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { PhygitalTokenType } from "phygital-token-sdk";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useRemoveOwnershipMutation,
  useSetLockStateMutation,
} from "@/hooks/home/use-token-mutations";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { cn } from "@/lib/utils";

type CollectionNoun = "accessory" | "card";

/**
 * Collection hub ⋮ menu — Lock / Unlock / Remove for a card or accessory row.
 * Stays on `/`; does not navigate away after remove.
 */
export function CollectionTokenMenu({
  owner,
  token,
  noun,
  className,
}: {
  owner: string;
  token: PhygitalToken;
  noun: CollectionNoun;
  className?: string;
}) {
  const setLock = useSetLockStateMutation(owner);
  const removeOwnership = useRemoveOwnershipMutation(owner);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const locking =
    setLock.isPending && setLock.variables?.token === token.address;
  const removing =
    removeOwnership.isPending &&
    removeOwnership.variables?.token === token.address;
  const busy = locking || removing;
  const canToggleLock = token.tokenType === PhygitalTokenType.Controlled;

  async function onToggleLock() {
    try {
      await setLock.mutateAsync({
        token: token.address,
        isLocked: !token.isLocked,
      });
      toast.success(
        token.isLocked
          ? `${capitalize(noun)} unlocked`
          : `${capitalize(noun)} locked`,
      );
    } catch (error) {
      toast.error(
        toUserErrorMessage(
          error,
          token.isLocked
            ? `Couldn’t unlock this ${noun}`
            : `Couldn’t lock this ${noun}`,
        ),
      );
    }
  }

  async function onRemove() {
    try {
      await removeOwnership.mutateAsync({ token: token.address });
      toast.success(`${capitalize(noun)} removed`);
      setConfirmRemove(false);
    } catch (error) {
      toast.error(toUserErrorMessage(error, `Couldn’t remove this ${noun}`));
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn("shrink-0 text-muted-foreground", className)}
            aria-label={`Manage ${noun}`}
            onClick={(e) => e.preventDefault()}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canToggleLock ? (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => void onToggleLock()}
            >
              {locking ? (
                <LoaderCircle className="size-3.5 animate-spin opacity-70" />
              ) : token.isLocked ? (
                <LockOpen className="size-3.5 opacity-70" />
              ) : (
                <Lock className="size-3.5 opacity-70" />
              )}
              {token.isLocked ? "Unlock" : "Lock"}
            </DropdownMenuItem>
          ) : null}
          {canToggleLock ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem
            disabled={busy}
            className="text-destructive focus:text-destructive"
            onSelect={() => setConfirmRemove(true)}
          >
            {removing ? (
              <LoaderCircle className="size-3.5 animate-spin opacity-70" />
            ) : (
              <Trash2 className="size-3.5 opacity-70" />
            )}
            Remove from wallet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmRemove}
        title={`Remove ${noun}?`}
        body={`Remove this ${noun} from your wallet? Anyone will be able to add it.`}
        confirmLabel="Remove"
        destructive
        busy={removing}
        onConfirm={() => void onRemove()}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
