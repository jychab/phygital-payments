"use client";

import { useMemo, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Repeat, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import { useAgentSessions } from "@/hooks/wallet/use-agent-grant";
import {
  formatTokenAmount,
  formatUsd,
  type WalletHolding,
  type WalletPortfolio,
} from "@/lib/wallet/portfolio";
import { parseSendIntent } from "@/lib/wallet/parse-send";
import { parseTaskIntent } from "@/lib/wallet/parse-task";
import type { PhygitalToken } from "@/lib/phygital/token";
import type { AgentSessionDetail } from "@/lib/server/agent-policy";
import type { ParsedTask } from "@/lib/wallet/parse-task";

const SUGGESTIONS = ["Send", "Receive", "DCA weekly"] as const;

function PortfolioHero({
  portfolio,
  isPending,
  isError,
}: {
  portfolio: WalletPortfolio | undefined;
  isPending: boolean;
  isError: boolean;
}) {
  const totalUsd = portfolio?.totalUsd;
  const solEq = portfolio?.solEquivalent;

  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Total balance
      </p>
      {isPending && !portfolio ? (
        <div className="mt-2 h-10 w-40 animate-pulse rounded-lg bg-muted/60" />
      ) : isError && !portfolio ? (
        <p className="mt-1 text-sm text-muted-foreground">Couldn&apos;t refresh</p>
      ) : (
        <>
          <p className="mt-1 text-3xl font-medium tabular-nums tracking-tight text-foreground">
            {formatUsd(totalUsd)}
          </p>
          {solEq != null ? (
            <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
              ≈ {formatTokenAmount(solEq)} SOL
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

function HoldingStripRow({ holding }: { holding: WalletHolding }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      {holding.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={holding.image}
          alt=""
          className="size-7 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-[9px] font-medium uppercase text-muted-foreground">
          {holding.symbol.slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">{holding.symbol}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {formatTokenAmount(holding.uiAmount)}
        </p>
      </div>
      {holding.usdValue != null ? (
        <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatUsd(holding.usdValue)}
        </p>
      ) : null}
    </div>
  );
}

function HoldingsStrip({
  portfolio,
  onSeeAll,
}: {
  portfolio: WalletPortfolio | undefined;
  onSeeAll: () => void;
}) {
  const strip = useMemo(() => {
    if (!portfolio) return [];
    const sol = portfolio.tokens.find((t) => t.kind === "native");
    const fungibles = portfolio.tokens
      .filter((t) => t.kind === "fungible")
      .slice(0, 2);
    return [sol, ...fungibles].filter((h): h is WalletHolding => h != null);
  }, [portfolio]);

  const collectibleCount = portfolio?.collectibles.length ?? 0;

  if (!portfolio || (strip.length === 0 && collectibleCount === 0)) return null;

  return (
    <section className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Holdings
        </p>
        <button
          type="button"
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-[11px] text-muted-foreground"
        >
          See all
          <ChevronRight className="size-3.5" />
        </button>
      </div>
      {strip.map((holding) => (
        <HoldingStripRow key={holding.id} holding={holding} />
      ))}
      {collectibleCount > 0 ? (
        <p className="border-t border-border/40 py-2 text-xs text-muted-foreground">
          {collectibleCount} collectible{collectibleCount === 1 ? "" : "s"}
        </p>
      ) : null}
    </section>
  );
}

function ActionTiles({
  onSend,
  onReceive,
  onAutomate,
}: {
  onSend: () => void;
  onReceive: () => void;
  onAutomate: () => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button type="button" size="lg" className="h-auto flex-col gap-1 py-3" onClick={onSend}>
        <ArrowUpRight className="size-4" />
        <span className="text-xs">Send</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-auto flex-col gap-1 py-3"
        onClick={onReceive}
      >
        <ArrowDownLeft className="size-4" />
        <span className="text-xs">Receive</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-auto flex-col gap-1 py-3"
        onClick={onAutomate}
      >
        <Repeat className="size-4" />
        <span className="text-xs">Automate</span>
      </Button>
    </div>
  );
}

function PhygitalTokenCard({
  hasActiveAgent,
  onAllowApps,
  onManage,
}: {
  hasActiveAgent: boolean;
  onAllowApps: () => void;
  onManage: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">Phygital ready</p>
      <p className="mt-1 text-xs text-muted-foreground">
        External apps can ask you to tap when paying.
      </p>
      <Button
        type="button"
        variant={hasActiveAgent ? "outline" : "default"}
        size="sm"
        className="mt-3 w-full"
        onClick={hasActiveAgent ? onManage : onAllowApps}
      >
        {hasActiveAgent ? "Manage apps access" : "Allow apps"}
      </Button>
    </div>
  );
}

function AutonomousAgentsCard({
  agents,
  onManage,
}: {
  agents: AgentSessionDetail[];
  onManage: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
      <p className="text-sm font-medium text-foreground">Running for you</p>
      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
        {agents.slice(0, 2).map((agent) => (
          <li key={agent.sessionPda}>· {agent.task?.label ?? "Scheduled task"}</li>
        ))}
        {agents.length > 2 ? (
          <li>· +{agents.length - 2} more</li>
        ) : null}
      </ul>
      <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={onManage}>
        Manage tasks
      </Button>
    </div>
  );
}

export function WalletHome({
  token,
  onSend,
  onReceive,
  onAutomate,
  onSettings,
  onHoldings,
  onAllowApps,
  onTaskDraft,
}: {
  token: PhygitalToken | null;
  onSend: (prompt: string) => void;
  onReceive: () => void;
  onAutomate: (draft?: ParsedTask | null) => void;
  onSettings: () => void;
  onHoldings: () => void;
  onAllowApps: () => void;
  onTaskDraft?: (draft: ParsedTask) => void;
}) {
  const { session } = useSmartWallet();
  const portfolioQuery = useWalletPortfolio(session?.vaultPda ?? null);
  const agentsQuery = useAgentSessions(session?.vaultPda ?? null);
  const [prompt, setPrompt] = useState("");
  const [inputHint, setInputHint] = useState<string | null>(null);

  const agents = agentsQuery.data ?? [];
  const nfcAgents = agents.filter((a) => a.kind === "nfc");
  const autonomousAgents = agents.filter((a) => a.kind === "autonomous");
  const nfcAgentForToken =
    token != null
      ? nfcAgents.find((a) => a.phygitalPasskey === token.secp256r1PublicKey)
      : undefined;
  const showPhygitalCard = token != null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = prompt.trim();
    if (!text) return;
    setInputHint(null);

    const send = parseSendIntent(text);
    if (send) {
      onSend(text);
      return;
    }

    const task = parseTaskIntent(text);
    if (task) {
      onTaskDraft?.(task);
      onAutomate(task);
      return;
    }

    if (/^receive\b/i.test(text)) {
      onReceive();
      return;
    }

    setInputHint("Try send, receive, or a recurring task — e.g. “Send 0.5 SOL to …”");
  }

  function applySuggestion(suggestion: string) {
    setInputHint(null);
    if (suggestion === "Send") {
      setPrompt("Send 0.5 SOL to ");
      return;
    }
    if (suggestion === "Receive") {
      onReceive();
      return;
    }
    setPrompt("DCA into BTC weekly");
  }

  const submitLabel = (() => {
    const text = prompt.trim();
    if (!text) return "Continue";
    if (parseSendIntent(text)) return "Review send";
    if (parseTaskIntent(text)) return "Set up task";
    if (/^receive\b/i.test(text)) return "Receive";
    return "Continue";
  })();

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <PortfolioHero
          portfolio={portfolioQuery.data}
          isPending={portfolioQuery.isPending}
          isError={portfolioQuery.isError}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onSettings}
          aria-label="Settings"
        >
          <Settings className="size-4" />
        </Button>
      </div>

      <HoldingsStrip portfolio={portfolioQuery.data} onSeeAll={onHoldings} />

      <ActionTiles
        onSend={() => onSend("")}
        onReceive={onReceive}
        onAutomate={() => onAutomate(null)}
      />

      {showPhygitalCard ? (
        <PhygitalTokenCard
          hasActiveAgent={Boolean(nfcAgentForToken)}
          onAllowApps={onAllowApps}
          onManage={onSettings}
        />
      ) : null}

      {autonomousAgents.length > 0 ? (
        <AutonomousAgentsCard agents={autonomousAgents} onManage={onSettings} />
      ) : null}

      <form onSubmit={onSubmit} className="mt-auto flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => applySuggestion(label)}
              className="rounded-full border border-border/50 px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              {label}
            </button>
          ))}
        </div>
        <label className="space-y-1.5">
          <span className="text-xs text-muted-foreground">Ask anything</span>
          <input
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setInputHint(null);
            }}
            placeholder="Send 0.5 SOL to …"
            className="h-11 w-full rounded-xl border border-border/60 bg-muted/40 px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        {inputHint ? (
          <p className="text-center text-xs text-muted-foreground">{inputHint}</p>
        ) : null}
        <Button type="submit" size="lg" className="w-full" disabled={!prompt.trim()}>
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}
