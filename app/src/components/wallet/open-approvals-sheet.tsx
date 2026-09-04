"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PolicyDeniedError } from "phygital-wallet-sdk";

import { NavBar } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { copy } from "@/lib/copy/phygital";
import { queryKeys } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  cancelOpenApproval,
  createOneTimeGrant,
  type OpenApproval,
} from "@/lib/wallet/policies-client";
import { policySoftDenyBody } from "@/lib/wallet/policy-deny-copy";

function approvalBody(approval: OpenApproval): string {
  const deny = new PolicyDeniedError({
    code: approval.code,
    error: approval.error,
    soft: true,
    intentHash: approval.intentHash,
    details: approval.details ?? undefined,
  });
  return policySoftDenyBody(deny);
}

function removeApproval(
  prev: OpenApproval[] | undefined,
  intentHash: string,
): OpenApproval[] {
  return (prev ?? []).filter((a) => a.intentHash !== intentHash);
}

/** Inbox for remote soft-deny requests — Approve once writes a grant only. */
export function OpenApprovalsSheet({
  phygitalTokenPda,
  approvals,
  onChangeLimits,
  onDone,
}: {
  phygitalTokenPda: string;
  approvals: OpenApproval[];
  onChangeLimits?: (code?: string) => void;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const approval = approvals[0] ?? null;

  useEffect(() => {
    if (approvals.length === 0) onDone();
  }, [approvals.length, onDone]);

  const approvalsKey = queryKeys.walletApprovals.byToken(phygitalTokenPda);

  const approve = useMutation({
    mutationFn: (intentHash: string) =>
      createOneTimeGrant(phygitalTokenPda, intentHash),
    onSuccess: (_data, intentHash) => {
      toast.success(copy.wallet.openApprovalContinue);
      queryClient.setQueryData(approvalsKey, (prev: OpenApproval[] | undefined) =>
        removeApproval(prev, intentHash),
      );
      void queryClient.invalidateQueries({ queryKey: approvalsKey });
    },
    onError: (e) => toast.error(toUserErrorMessage(e)),
  });

  const cancel = useMutation({
    mutationFn: (intentHash: string) =>
      cancelOpenApproval(phygitalTokenPda, intentHash),
    onSuccess: (_data, intentHash) => {
      queryClient.setQueryData(approvalsKey, (prev: OpenApproval[] | undefined) =>
        removeApproval(prev, intentHash),
      );
      void queryClient.invalidateQueries({ queryKey: approvalsKey });
    },
    onError: (e) => toast.error(toUserErrorMessage(e)),
  });

  const busy = approve.isPending || cancel.isPending;

  if (!approval) return null;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => void cancel.mutateAsync(approval.intentHash)}
          >
            {copy.common.cancel}
          </Button>
        }
        title={copy.wallet.openApprovalsTitle}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
        <h2 className="font-(family-name:--font-display) text-2xl font-medium">
          {copy.wallet.approveSendTitle}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          {approvalBody(approval)}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={() => void approve.mutateAsync(approval.intentHash)}
        >
          {busy ? (
            <Spinner className="size-4" />
          ) : (
            copy.wallet.approveOnce
          )}
        </Button>
        {onChangeLimits ? (
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={busy}
            onClick={() => onChangeLimits(approval.code)}
          >
            {copy.wallet.changeLimits}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
