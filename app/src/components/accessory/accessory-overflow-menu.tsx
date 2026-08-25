"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, History, LoaderCircle, Lock, LockOpen, MoreHorizontal, Trash2, Wallet } from "lucide-react";
import { PhygitalTokenType } from "phygital-token-sdk";

import { HistoryPanel } from "@/components/home/history-panel";
import { PayScreen } from "@/components/pay/pay-screen";
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
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type AccessorySubview = "main" | "pay" | "activity";

/** Pay, Activity, and manage — accessory task journey only. */
export function AccessoryOverflowMenu({
  owner,
  token,
  subview,
  onSubviewChange,
  className,
}: {
  owner: string;
  token?: PhygitalToken;
  subview: AccessorySubview;
  onSubviewChange: (view: AccessorySubview) => void;
  className?: string;
}) {
  const setLock = useSetLockStateMutation(owner);
  const removeOwnership = useRemoveOwnershipMutation(owner);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const lockingThis =
    token != null &&
    setLock.isPending &&
    setLock.variables?.token === token.address;
  const removingThis =
    token != null &&
    removeOwnership.isPending &&
    removeOwnership.variables?.token === token.address;
  const manageBusy = lockingThis || removingThis;
  const canToggleLock =
    token != null && token.tokenType === PhygitalTokenType.Controlled;

  async function onToggleLock() {
    if (!token) return;
    try {
      await setLock.mutateAsync({
        token: token.address,
        isLocked: !token.isLocked,
      });
      toast.success(token.isLocked ? "Accessory unlocked" : "Accessory locked");
    } catch (error) {
      toast.error(
        toUserErrorMessage(
          error,
          token.isLocked
            ? "Couldn’t unlock this accessory"
            : "Couldn’t lock this accessory",
        ),
      );
    }
  }

  async function onRemoveOwnership() {
    if (!token) return;
    try {
      await removeOwnership.mutateAsync({ token: token.address });
      toast.success("Accessory removed");
      setConfirmRemove(false);
    } catch (error) {
      toast.error(
        toUserErrorMessage(error, "Couldn’t remove this accessory"),
      );
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
            className={cn("text-muted-foreground", className)}
            aria-label="More options"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onSelect={() => onSubviewChange("pay")}
            className={subview === "pay" ? "bg-muted/50" : undefined}
          >
            <Wallet className="size-3.5 opacity-70" />
            Pay settings
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => onSubviewChange("activity")}
            className={subview === "activity" ? "bg-muted/50" : undefined}
          >
            <History className="size-3.5 opacity-70" />
            Activity
          </DropdownMenuItem>
          {token ? (
            <>
              <DropdownMenuSeparator />
              {canToggleLock ? (
                <DropdownMenuItem
                  disabled={manageBusy}
                  onSelect={() => void onToggleLock()}
                >
                  {lockingThis ? (
                    <LoaderCircle className="size-3.5 animate-spin opacity-70" />
                  ) : token.isLocked ? (
                    <LockOpen className="size-3.5 opacity-70" />
                  ) : (
                    <Lock className="size-3.5 opacity-70" />
                  )}
                  {token.isLocked ? "Unlock" : "Lock"}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem
                disabled={manageBusy}
                className="text-destructive focus:text-destructive"
                onSelect={() => setConfirmRemove(true)}
              >
                {removingThis ? (
                  <LoaderCircle className="size-3.5 animate-spin opacity-70" />
                ) : (
                  <Trash2 className="size-3.5 opacity-70" />
                )}
                Remove from wallet
              </DropdownMenuItem>
            </>
          ) : null}
          {subview !== "main" ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => onSubviewChange("main")}>
                Back to accessory
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      {token ? (
        <ConfirmDialog
          open={confirmRemove}
          title="Remove accessory?"
          body="Remove this accessory from your wallet? Anyone will be able to add it."
          confirmLabel="Remove"
          destructive
          busy={removingThis}
          onConfirm={() => void onRemoveOwnership()}
          onCancel={() => setConfirmRemove(false)}
        />
      ) : null}
    </>
  );
}

export function AccessorySubviewHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className={cn("mb-4 flex items-center gap-2", galleryAnimate.fade)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onBack}
        aria-label="Back"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <h1 className="font-(family-name:--font-display) text-lg tracking-tight">
        {title}
      </h1>
    </div>
  );
}

export function AccessoryToolsPanel({
  owner,
  subview,
  onSubviewChange,
  tokenAddress,
}: {
  owner: string;
  subview: AccessorySubview;
  onSubviewChange: (view: AccessorySubview) => void;
  tokenAddress?: string;
}) {
  if (subview === "pay") {
    return (
      <>
        <AccessorySubviewHeader
          title="Pay settings"
          onBack={() => onSubviewChange("main")}
        />
        <PayScreen owner={owner} tokenAddress={tokenAddress} active />
      </>
    );
  }

  if (subview === "activity") {
    return (
      <>
        <AccessorySubviewHeader
          title="Activity"
          onBack={() => onSubviewChange("main")}
        />
        <HistoryPanel owner={owner} />
      </>
    );
  }

  return null;
}
