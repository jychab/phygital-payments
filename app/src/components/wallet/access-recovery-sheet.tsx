"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { NavBar, NavBarBack } from "@/components/shared/nav-bar";
import { GroupedList, GroupedRow } from "@/components/shared/grouped-list";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { WalletRole } from "@/components/token/token-address-route";
import {
  recoveryWalletSubtitle,
  useRecoveryWallet,
} from "@/hooks/wallet/use-recovery-wallet";
import { useWalletPolicy } from "@/hooks/wallet/use-wallet-policy";
import { copy } from "@/lib/copy/phygital";
import { queryKeys } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import { unlinkToken, clearAccessoryProof, clearPossessionToken, type LinkStatus } from "@/lib/wallet/device-auth-client";
import { redirectToLimitsSetup } from "@/lib/wallet/limits-setup-href";

/** Access: recovery status and unlink (owners); link path (visitors). */
export function AccessRecoverySheet({
  phygitalTokenPda,
  role,
  linkStatus,
  onBack,
  onOpenRecovery,
}: {
  phygitalTokenPda: string;
  role: WalletRole;
  linkStatus?: LinkStatus;
  onBack: () => void;
  /** Owner: open recovery set/clear sheet. */
  onOpenRecovery?: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const isOwner = role === "owner";
  const recovery = useRecoveryWallet(isOwner ? phygitalTokenPda : null);
  const policy = useWalletPolicy(isOwner ? phygitalTokenPda : null);
  const policyOn = policy.data?.status === "ok";
  const linkedElsewhere = linkStatus === "linked_elsewhere";

  async function unlink() {
    setBusy(true);
    try {
      await unlinkToken(phygitalTokenPda);
      clearPossessionToken(phygitalTokenPda);
      clearAccessoryProof(phygitalTokenPda);
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

  const recoverySubtitle = recoveryWalletSubtitle(
    recovery.data,
    recovery.isLoading,
  );

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={<NavBarBack onClick={onBack} />}
        title={copy.wallet.accessAndRecovery}
      />
      <div className="space-y-2 px-1">
        <p className="text-sm font-medium">{copy.wallet.accessAndRecoveryHint}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {isOwner
            ? copy.wallet.accessAndRecoveryBody
            : linkedElsewhere
              ? copy.wallet.limitsLinkedElsewhereBody
              : copy.wallet.deviceLinkBody}
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
      ) : null}

      <div className="mt-auto flex flex-col gap-2">
        {isOwner ? (
          <p className="text-sm text-muted-foreground">
            {copy.wallet.deviceAuthReady}
          </p>
        ) : null}
        {isOwner && policyOn ? (
          <p className="text-xs text-muted-foreground">
            {copy.wallet.deviceUnlinkPolicyWarn}
          </p>
        ) : null}
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
        ) : linkedElsewhere ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            {copy.common.done}
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() =>
              redirectToLimitsSetup(phygitalTokenPda, "spendingLimits")
            }
          >
            {copy.wallet.limitsSetupCta}
          </Button>
        )}
      </div>
    </div>
  );
}

