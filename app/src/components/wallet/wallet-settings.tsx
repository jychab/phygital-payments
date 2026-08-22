"use client";

import { useState } from "react";

import { BackLink } from "@/components/shared/back-link";
import { Button } from "@/components/ui/button";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { useAgentSessions } from "@/hooks/wallet/use-agent-grant";
import { shortAddress } from "@/lib/utils";
import { queryFetch, queryKeys, readJson } from "@/lib/queries";
import { useQueryClient } from "@tanstack/react-query";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { buildRevokeSessionInner } from "@/lib/lazorkit/session";
import { address } from "@solana/kit";
import { toUserErrorMessage } from "@/lib/user-errors";
import { WalletBusyStatus } from "@/components/layout/gate-message";
import type { AgentSessionDetail } from "@/lib/server/agent-policy";
import { formatSol } from "@/lib/wallet/sol";

function formatExpiry(expiresAtMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(expiresAtMs));
}

function formatSpendingLimit(lamports: string | null): string {
  if (!lamports) return "No cap";
  try {
    return `${formatSol(BigInt(lamports))} SOL per run`;
  } catch {
    return "No cap";
  }
}

function AgentCard({
  agent,
  revoking,
  onRevoke,
}: {
  agent: AgentSessionDetail;
  revoking: boolean;
  onRevoke: () => void;
}) {
  const isNfc = agent.kind === "nfc";

  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {isNfc
              ? "NFC agent"
              : agent.task?.label ?? "Autonomous agent"}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {shortAddress(agent.sessionPda, 6)}
          </p>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Active
        </span>
      </div>

      <dl className="space-y-2 text-xs">
        {isNfc ? (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Phygital</dt>
            <dd className="text-right text-foreground">
              {agent.hasPhygitalToken && agent.phygitalPasskey
                ? shortAddress(agent.phygitalPasskey, 6)
                : "Not linked"}
            </dd>
          </div>
        ) : (
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Task</dt>
            <dd className="max-w-[60%] text-right text-foreground">
              {agent.task?.label ?? "—"}
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Valid until</dt>
          <dd className="text-right text-foreground">
            {formatExpiry(agent.expiresAtMs)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Spending limit</dt>
          <dd className="text-right text-foreground">
            {formatSpendingLimit(agent.spendingLimitLamports)}
          </dd>
        </div>
      </dl>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Permissions
        </p>
        <ul className="space-y-1 text-xs text-foreground">
          {agent.permissions.map((permission) => (
            <li key={permission} className="flex gap-2">
              <span className="text-muted-foreground">·</span>
              <span>{permission}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={revoking}
        onClick={onRevoke}
      >
        {revoking ? "Revoking…" : "Revoke agent"}
      </Button>
    </div>
  );
}

function AgentSection({
  title,
  description,
  agents,
  emptyMessage,
  revokingPda,
  onRevoke,
}: {
  title: string;
  description: string;
  agents: AgentSessionDetail[];
  emptyMessage: string;
  revokingPda: string | null;
  onRevoke: (agent: AgentSessionDetail) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {agents.length === 0 ? (
        <p className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.sessionPda}
              agent={agent}
              revoking={revokingPda === agent.sessionPda}
              onRevoke={() => onRevoke(agent)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function WalletSettings({
  onBack,
}: {
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const { session, disconnect } = useSmartWallet();
  const agentsQuery = useAgentSessions(session?.vaultPda ?? null);
  const [revokingPda, setRevokingPda] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const agents = agentsQuery.data ?? [];
  const nfcAgents = agents.filter((agent) => agent.kind === "nfc");
  const autonomousAgents = agents.filter((agent) => agent.kind === "autonomous");
  const busy = revokingPda != null;

  async function onRevoke(agent: AgentSessionDetail) {
    if (!session) return;
    setRevokingPda(agent.sessionPda);
    setError(null);
    try {
      await executeAsVault({
        session,
        inner: [
          buildRevokeSessionInner({
            vaultPda: session.vaultPda,
            walletPda: session.walletPda,
            authorityPda: session.authorityPda,
            sessionPda: address(agent.sessionPda),
          }),
        ],
      }).catch(() => {
        /* KV unbind still stops /sign */
      });
      await queryFetch("/api/agent/grant", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionPda: agent.sessionPda }),
      }).then((res) => readJson(res, "Couldn’t revoke"));
      await queryClient.invalidateQueries({
        queryKey: queryKeys.agentSession.byVault(String(session.vaultPda)),
      });
    } catch (err) {
      setError(toUserErrorMessage(err, "Couldn’t revoke. Try again."));
    } finally {
      setRevokingPda(null);
    }
  }

  if (busy) return <WalletBusyStatus connecting />;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <BackLink onClick={onBack} />
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">Settings</p>
        <p className="text-sm text-muted-foreground">
          Your Face ID is this wallet. There is no recovery phrase.
        </p>
      </div>

      <div className="space-y-6">
        {agentsQuery.isPending ? (
          <p className="text-xs text-muted-foreground">Loading agents…</p>
        ) : (
          <>
            <AgentSection
              title="NFC agents"
              description="External apps trigger these when you tap your phygital."
              agents={nfcAgents}
              emptyMessage="None active. Allow an app to use your phygital after claiming it."
              revokingPda={revokingPda}
              onRevoke={(agent) => void onRevoke(agent)}
            />
            <AgentSection
              title="Autonomous agents"
              description="These run assigned tasks on their own, like recurring swaps."
              agents={autonomousAgents}
              emptyMessage="None active. Assign a task from the wallet home screen."
              revokingPda={revokingPda}
              onRevoke={(agent) => void onRevoke(agent)}
            />
          </>
        )}

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      <Button type="button" variant="ghost" className="mt-auto w-full" onClick={() => void disconnect()}>
        Sign out
      </Button>
      {session ? (
        <p className="text-center font-mono text-[11px] text-muted-foreground">
          {shortAddress(String(session.vaultPda), 6)}
        </p>
      ) : null}
    </div>
  );
}
