"use client";

import { ChevronRight, LoaderCircle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCloseAgentSession } from "@/hooks/wallet/use-agent-mutations";
import {
  spendRowCaption,
  summarizeSpendPolicy,
} from "@/lib/wallet/spend-policy";
import type { AgentSessionDetail } from "@/lib/wallet/agent-policy";
import { toUserErrorMessage } from "@/lib/user-errors";

function formatExpiry(expiresAtMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(expiresAtMs));
}

function formatRelativeExpiry(expiresAtMs: number): string {
  const delta = expiresAtMs - Date.now();
  if (delta <= 0) return "Expired";
  const days = Math.ceil(delta / (24 * 60 * 60 * 1000));
  if (days <= 1) return "Expires today";
  return `Expires in ${days} days`;
}

function spendingTitle(agent: AgentSessionDetail): string {
  if (agent.task?.label) return agent.task.label;
  return "Tap to pay";
}

export function SpendingListRow({
  agent,
  onSelect,
}: {
  agent: AgentSessionDetail;
  onSelect: () => void;
}) {
  const unbound = agent.kind === "nfc" && agent.hasPhygitalToken === false;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 px-1 py-2.5 text-left hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {spendingTitle(agent)}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {spendRowCaption(agent.actions)}
          {" · "}
          {formatRelativeExpiry(agent.expiresAtMs)}
          {unbound ? " · Accessory unbound" : ""}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function SpendingDetailCard({
  agent,
  onClosed,
}: {
  agent: AgentSessionDetail;
  onClosed?: () => void;
}) {
  const closeAgent = useCloseAgentSession();
  const busy = closeAgent.isPending;
  const error = closeAgent.error
    ? toUserErrorMessage(
        closeAgent.error,
        "Couldn’t turn off spending. Try again.",
      )
    : null;

  function onClose() {
    closeAgent.reset();
    closeAgent.mutate(agent.sessionPda, { onSuccess: () => onClosed?.() });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            {spendingTitle(agent)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Other apps can charge this wallet only when you tap this accessory.
          </p>
        </div>
        <Badge className="border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
          On
        </Badge>
      </div>

      <div className="space-y-2 text-xs">
        <ul className="space-y-1.5">
          {summarizeSpendPolicy(agent.actions).map((line, index) => (
            <li
              key={`${index}-${line}`}
              className="flex justify-between gap-3"
            >
              <span className="text-foreground">{line}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Expires</span>
          <span className="text-right text-foreground">
            {formatExpiry(agent.expiresAtMs)}
          </span>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={busy}
          >
            Turn off spending
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off spending?</AlertDialogTitle>
            <AlertDialogDescription>
              This accessory will stop paying until you set a new limit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={busy}
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
            >
              {busy ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                "Turn off"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
