"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { ApiKeyPanel } from "@/components/pay/api-key-panel";
import { BackLink } from "@/components/shared/back-link";
import { SettingsListRow } from "@/components/shared/settings-list-row";
import {
  usePreauthRequired,
  useSetPreauthRequired,
} from "@/hooks/pay/use-preauth-required";
import { useExpectedWallet } from "@/hooks/wallet/use-expected-wallet";
import { payCopy } from "@/lib/copy/phygital";
import { toUserErrorMessage } from "@/lib/user-errors";
import { cn } from "@/lib/utils";

/** Pay settings — pre-confirmation and this-phone authorization only. */
export function ManagePayPanel({
  owner,
  onBack,
}: {
  owner: string;
  onBack?: () => void;
}) {
  const [manageKeys, setManageKeys] = useState(false);
  const requiredQuery = usePreauthRequired(owner);
  const preConfirmationOn = requiredQuery.data?.required === true;
  const keyReady = requiredQuery.data?.keyOk === true;

  if (manageKeys) {
    return (
      <ApiKeyPanel
        owner={owner}
        onStored={() => setManageKeys(false)}
        onBack={() => setManageKeys(false)}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {onBack ? (
        <div className="flex items-center gap-2">
          <BackLink onClick={onBack} />
        </div>
      ) : null}

      <div className="space-y-1.5 text-center">
        <h1 className="font-(family-name:--font-display) text-2xl tracking-tight">
          {payCopy.paySettings}
        </h1>
        <p className="mx-auto max-w-64 text-sm text-muted-foreground">
          {preConfirmationOn
            ? "Pre-confirmation and this phone."
            : "How this accessory pays."}
        </p>
      </div>

      <PreConfirmationRow
        owner={owner}
        on={preConfirmationOn}
        pending={requiredQuery.isPending}
      />

      {preConfirmationOn ? (
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {payCopy.thisPhone}
          </p>
          <SettingsListRow
            title={
              keyReady ? "Authorized on this phone" : payCopy.authorizePhone
            }
            subtitle={
              keyReady
                ? "Pre-confirmation works here."
                : payCopy.authorizeSubtitle
            }
            truncate={false}
            onSelect={() => setManageKeys(true)}
            trailing={
              <span className="text-[11px] font-medium text-primary">
                {keyReady ? "Manage" : "Authorize"}
              </span>
            }
          />
        </div>
      ) : null}
    </div>
  );
}

function PreConfirmationRow({
  owner,
  on,
  pending,
}: {
  owner: string;
  on: boolean;
  pending: boolean;
}) {
  const { setRequired } = useSetPreauthRequired();
  const { matched, connect, wrongWallet, ownerShort } =
    useExpectedWallet(owner);
  const [busy, setBusy] = useState(false);

  async function onToggle() {
    if (wrongWallet) return;
    if (!matched) {
      void connect();
      return;
    }
    try {
      setBusy(true);
      await setRequired(owner, !on);
    } catch (error) {
      toast.error(
        toUserErrorMessage(error, "Couldn’t update pre-confirmation."),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <SettingsListRow
        title={payCopy.preConfirmation}
        subtitle={
          on
            ? payCopy.preConfirmationOnSubtitle
            : payCopy.preConfirmationOffSubtitle
        }
        truncate={false}
        onSelect={() => void onToggle()}
        disabled={busy || pending || wrongWallet}
        trailing={
          busy || pending ? (
            <LoaderCircle className="size-3.5 animate-spin text-muted-foreground" />
          ) : (
            <span
              className={cn(
                "text-[11px] font-medium",
                on ? "text-primary" : "text-muted-foreground",
              )}
            >
              {on ? "On" : "Off"}
            </span>
          )
        }
      />
      {wrongWallet ? (
        <p className="px-2 text-center text-xs text-destructive">
          Disconnect above, then connect {ownerShort} to change this.
        </p>
      ) : !matched ? (
        <p className="px-2 text-center text-xs text-muted-foreground">
          Connect {ownerShort} to change pre-confirmation.
        </p>
      ) : null}
    </div>
  );
}
