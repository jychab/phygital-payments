"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { PolicyDeniedError } from "phygital-wallet-sdk";

import { NavBar } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
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
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const approval =
    approvals[Math.min(index, Math.max(0, approvals.length - 1))] ?? null;

  useEffect(() => {
    if (approvals.length === 0) onDone();
  }, [approvals.length, onDone]);

  async function invalidate() {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.walletApprovals.byToken(phygitalTokenPda),
    });
  }

  async function approveOnce() {
    if (!approval) return;
    setBusy(true);
    try {
      await createOneTimeGrant(phygitalTokenPda, approval.intentHash);
      toast.success(copy.wallet.openApprovalContinue);
      await invalidate();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!approval) return;
    setBusy(true);
    try {
      await cancelOpenApproval(phygitalTokenPda, approval.intentHash);
      await invalidate();
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

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
            onClick={() => void cancel()}
          >
            {copy.common.cancel}
          </Button>
        }
        title={copy.wallet.send}
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
          onClick={() => void approveOnce()}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
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
