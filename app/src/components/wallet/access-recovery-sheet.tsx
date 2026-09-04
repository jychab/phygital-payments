"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { NavBar } from "@/components/shared/nav-bar";
import { GroupedList, GroupedRow } from "@/components/shared/grouped-list";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { WalletRole } from "@/components/token/token-address-route";
import { useRecoveryWallet } from "@/hooks/wallet/use-recovery-wallet";
import { copy } from "@/lib/copy/phygital";
import { queryKeys } from "@/lib/queries";
import { shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";
import { unlinkToken } from "@/lib/wallet/device-auth-client";

/** Access: recovery status and unlink this item (owners). */
export function AccessRecoverySheet({
  phygitalTokenPda,
  role,
  onBack,
  onOpenRecovery,
}: {
  phygitalTokenPda: string;
  role: WalletRole;
  onBack: () => void;
  /** Owner: open recovery set/clear sheet. */
  onOpenRecovery?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const isOwner = role === "owner";
  const recovery = useRecoveryWallet(isOwner ? phygitalTokenPda : null);

  async function unlink() {
    setBusy(true);
    try {
      await unlinkToken(phygitalTokenPda);
      toast.success(copy.wallet.deviceUnlinked);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.deviceAuth.all(),
      });
      router.push("/");
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const recoverySubtitle = recovery.data?.configured && recovery.data.recoveryWallet
    ? shortAddress(recovery.data.recoveryWallet, 4)
    : copy.wallet.recoveryWalletNotConfigured;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            {copy.common.back}
          </Button>
        }
        title={copy.wallet.accessAndRecovery}
      />
      <div className="space-y-2 px-1">
        <p className="text-sm font-medium">{copy.wallet.accessAndRecoveryHint}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {copy.wallet.accessAndRecoveryBody}
        </p>
      </div>

      {isOwner && onOpenRecovery ? (
        <GroupedList>
          <GroupedRow
            onClick={onOpenRecovery}
            subtitle={
              recovery.isLoading
                ? copy.common.loading
                : recoverySubtitle
            }
          >
            {copy.wallet.accessRecoveryRow}
          </GroupedRow>
        </GroupedList>
      ) : !isOwner ? (
        <p className="px-1 text-sm text-muted-foreground">
          {copy.wallet.accessRecoveryAskOwner}
        </p>
      ) : null}

      <div className="mt-auto flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {copy.wallet.deviceAuthReady}
        </p>
        {isOwner ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={busy}
            onClick={() => void unlink()}
          >
            {busy ? <Spinner className="size-4" /> : copy.wallet.deviceUnlink}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
