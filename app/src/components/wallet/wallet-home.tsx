"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  Copy,
  Nfc,
} from "lucide-react";
import { toast } from "sonner";

import { AddressQr } from "@/components/wallet/address-qr";
import { SpendingDetailCard } from "@/components/wallet/agent-detail";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthenticatePhygital } from "@/hooks/phygital/use-authenticate-phygital";
import { useWalletDashboard } from "@/hooks/wallet/use-wallet-dashboard";
import { fetchWalletActivity, useWalletActivity } from "@/hooks/wallet/use-wallet-activity";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { queryKeys, queryOptions } from "@/lib/queries";
import type { AgentSessionDetail } from "@/lib/wallet/agent-policy";
import { shortAddress } from "@/lib/utils";
import type { WalletActivityItem } from "@/lib/wallet/activity";
import {
  formatTokenAmount,
  formatUsd,
  type WalletHolding,
} from "@/lib/wallet/portfolio";
import { spendRowCaption } from "@/lib/wallet/spend-policy";
import { isUnclaimedToken, type PhygitalToken } from "@/lib/phygital/token";
import {
  toPhygitalTokenWire,
  type PhygitalTokenWire,
} from "@/lib/phygital/token-wire";
import type { SendDraft } from "@/components/wallet/send-confirm";

const SpendingSheet = dynamic(
  () =>
    import("@/components/wallet/spending-sheet").then((m) => m.SpendingSheet),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> },
);

const SendConfirmCard = dynamic(
  () => import("@/components/wallet/send-confirm").then((m) => m.SendConfirmCard),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> },
);

const HoldToAccessory = dynamic(
  () =>
    import("@/components/phygital/hold-to-accessory").then(
      (m) => m.HoldToAccessory,
    ),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> },
);

const ClaimPanel = dynamic(
  () =>
    import("@/components/phygital/claim-panel").then((m) => m.ClaimPanel),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> },
);

const AuthenticCardPanel = dynamic(
  () =>
    import("@/components/card/authentic-card-panel").then(
      (m) => m.AuthenticCardPanel,
    ),
  { loading: () => <Skeleton className="h-48 w-full rounded-xl" /> },
);

type PanelTab = "tokens" | "collectibles" | "activity";

type StackView =
  | { kind: "home"; tab: PanelTab }
  | { kind: "send-pick" }
  | { kind: "send"; draft: SendDraft }
  | { kind: "receive" }
  | { kind: "spending"; accessory: PhygitalTokenWire }
  | { kind: "spend-detail"; agent: AgentSessionDetail }
  | { kind: "hold-add" }
  | { kind: "claim"; token: PhygitalToken }
  | { kind: "foreign"; token: PhygitalToken };

const activityTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatActivityTime(blockTime: number | null): string {
  if (blockTime == null) return "";
  return activityTimeFormat.format(new Date(blockTime * 1000));
}

function sortTokens(tokens: WalletHolding[]): WalletHolding[] {
  return [...tokens].sort((a, b) => {
    if (a.kind === "native" && b.kind !== "native") return -1;
    if (b.kind === "native" && a.kind !== "native") return 1;
    return (b.usdValue ?? 0) - (a.usdValue ?? 0);
  });
}

function stackTitle(view: StackView): string {
  switch (view.kind) {
    case "home":
      return "Wallet";
    case "receive":
      return "Receive";
    case "send-pick":
    case "send":
      return "Send";
    case "spending":
      return "Tap to pay";
    case "spend-detail":
      return "Spending";
    case "hold-add":
      return "Add accessory";
    case "claim":
      return "Add to Wallet";
    case "foreign":
      return "Accessory";
  }
}

function nfcSpendingFor(
  agents: AgentSessionDetail[],
  passkey: string,
): AgentSessionDetail | undefined {
  return agents.find(
    (agent) =>
      agent.kind === "nfc" && agent.phygitalPasskey === passkey,
  );
}

export function WalletHome({
  focusedAccessory = null,
}: {
  focusedAccessory?: PhygitalToken | null;
}) {
  const { session } = useSmartWallet();
  const queryClient = useQueryClient();
  const { authenticate } = useAuthenticatePhygital();
  const [view, setView] = useState<StackView>({ kind: "home", tab: "tokens" });
  const [copied, setCopied] = useState(false);
  const [holdAttempt, setHoldAttempt] = useState<Promise<{
    secp256r1PublicKey: string;
  }> | null>(null);
  const dashboardQuery = useWalletDashboard(session?.vaultPda ?? null);
  const activityEnabled = view.kind === "home" && view.tab === "activity";
  const activityQuery = useWalletActivity(
    session?.vaultPda ?? null,
    activityEnabled,
  );

  const prefetchActivity = useCallback(() => {
    const vault = session?.vaultPda;
    if (!vault) return;
    void queryClient.prefetchQuery({
      queryKey: queryKeys.walletActivity.byVault(String(vault)),
      queryFn: () => fetchWalletActivity(vault),
      ...queryOptions.wallet,
    });
  }, [queryClient, session?.vaultPda]);

  const onHoldFound = useCallback(
    (token: PhygitalToken) => {
      const vault = session?.vaultPda;
      if (vault && token.currentOwner === vault) {
        toast.success("Already in this wallet");
        setHoldAttempt(null);
        setView({ kind: "home", tab: "tokens" });
        return;
      }
      if (isUnclaimedToken(token)) {
        setView({ kind: "claim", token });
        return;
      }
      setView({ kind: "foreign", token });
    },
    [session?.vaultPda],
  );

  const portfolio = dashboardQuery.data?.portfolio;
  const nfcAgents = useMemo(
    () =>
      (dashboardQuery.data?.agents ?? []).filter((agent) => agent.kind === "nfc"),
    [dashboardQuery.data?.agents],
  );
  const activity = activityQuery.data ?? [];
  const vault = session ? String(session.vaultPda) : "";

  const tokens = useMemo(
    () => sortTokens(portfolio?.tokens ?? []),
    [portfolio?.tokens],
  );
  const collectibles = useMemo(
    () => portfolio?.collectibles ?? [],
    [portfolio?.collectibles],
  );

  const accessories = useMemo(() => {
    const list = dashboardQuery.data?.accessories ?? [];
    if (!focusedAccessory) return list;
    if (
      list.some(
        (item) =>
          item.secp256r1PublicKey === focusedAccessory.secp256r1PublicKey,
      )
    ) {
      return list;
    }
    return [toPhygitalTokenWire(focusedAccessory), ...list];
  }, [dashboardQuery.data?.accessories, focusedAccessory]);

  function goHome(tab: PanelTab = "tokens") {
    setHoldAttempt(null);
    setView({ kind: "home", tab });
  }

  function onHoldToAdd() {
    setHoldAttempt(authenticate());
    setView({ kind: "hold-add" });
  }

  async function onCopy() {
    if (!vault) return;
    await navigator.clipboard.writeText(vault);
    setCopied(true);
    toast.success("Address copied");
    window.setTimeout(() => setCopied(false), 1500);
  }

  function openAccessory(accessory: PhygitalTokenWire) {
    const spending = nfcSpendingFor(nfcAgents, accessory.secp256r1PublicKey);
    if (spending) {
      setView({ kind: "spend-detail", agent: spending });
      return;
    }
    setView({ kind: "spending", accessory });
  }

  function onSendHome() {
    if (tokens.length === 0) {
      setView({ kind: "receive" });
      return;
    }
    if (tokens.length === 1) {
      setView({
        kind: "send",
        draft: { holding: tokens[0]!, amount: "", destination: "" },
      });
      return;
    }
    setView({ kind: "send-pick" });
  }

  const showBack = view.kind !== "home";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {showBack ? (
        <div className="flex shrink-0 items-center gap-2 border-b border-border/40 pb-3 md:pb-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Back"
            onClick={() => goHome()}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="min-w-0 flex-1 text-sm font-medium text-foreground md:text-base">
            {stackTitle(view)}
          </p>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col">
        {view.kind === "home" ? (
          <HomeView
            tab={view.tab}
            onTabChange={(tab) => setView({ kind: "home", tab })}
            totalUsd={portfolio?.totalUsd}
            portfolioPending={dashboardQuery.isPending && !portfolio}
            vault={vault}
            copied={copied}
            onCopy={() => void onCopy()}
            onReceive={() => setView({ kind: "receive" })}
            onSend={onSendHome}
            tokens={tokens}
            collectibles={collectibles}
            tokensPending={dashboardQuery.isPending && !portfolio}
            activity={activity}
            activityPending={activityQuery.isPending}
            accessories={accessories}
            accessoriesPending={dashboardQuery.isPending}
            nfcAgents={nfcAgents}
            focusedPasskey={focusedAccessory?.secp256r1PublicKey ?? null}
            onPickAccessory={openAccessory}
            onHoldToAdd={onHoldToAdd}
            onPickToken={(holding) =>
              setView({
                kind: "send",
                draft: { holding, amount: "", destination: "" },
              })
            }
            onPickCollectible={(holding) =>
              setView({
                kind: "send",
                draft: { holding, amount: "1", destination: "" },
              })
            }
            onPrefetchActivity={prefetchActivity}
          />
        ) : null}

        {view.kind === "send-pick" ? (
          <div className="min-h-0 flex-1 overflow-y-auto py-2">
            {tokens.length === 0 ? (
              <EmptyState
                title="No tokens yet"
                actionLabel="Receive"
                onAction={() => setView({ kind: "receive" })}
              />
            ) : (
              <div className="divide-y divide-border/40">
                {tokens.map((holding) => (
                  <TokenRow
                    key={holding.id}
                    holding={holding}
                    onClick={() =>
                      setView({
                        kind: "send",
                        draft: { holding, amount: "", destination: "" },
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {view.kind === "send" ? (
          <div className="min-h-0 flex-1 overflow-y-auto py-3 md:py-4">
            <SendConfirmCard
              draft={view.draft}
              onCancel={() => goHome("tokens")}
              onSuccess={() => {
                toast.success(`Sent ${view.draft.holding.symbol}`);
                goHome("activity");
              }}
            />
          </div>
        ) : null}

        {view.kind === "receive" ? (
          <div className="flex min-h-0 flex-1 flex-col items-center gap-4 overflow-y-auto py-6 md:py-8">
            <p className="text-center text-sm text-muted-foreground">
              Send SOL and tokens to this address.
            </p>
            {vault ? <AddressQr value={vault} size={200} /> : null}
            <p className="max-w-full break-all px-2 text-center font-mono text-xs text-foreground md:text-sm">
              {vault || "—"}
            </p>
            <Button
              type="button"
              size="lg"
              className="w-full max-w-xs"
              onClick={() => void onCopy()}
            >
              <Copy className="size-4" />
              {copied ? "Copied" : "Copy address"}
            </Button>
          </div>
        ) : null}

        {view.kind === "spending" ? (
          <div className="min-h-0 flex-1 overflow-y-auto py-3 md:py-4">
            <SpendingSheet
              accessory={view.accessory}
              onCancel={() => goHome()}
              onSuccess={() => {
                toast.success("Tap to pay is on");
                goHome();
              }}
            />
          </div>
        ) : null}

        {view.kind === "spend-detail" ? (
          <div className="min-h-0 flex-1 overflow-y-auto py-3 md:py-4">
            <SpendingDetailCard
              agent={view.agent}
              onClosed={() => {
                toast.success("Spending turned off");
                goHome();
              }}
            />
          </div>
        ) : null}

        {view.kind === "hold-add" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <HoldToAccessory started={holdAttempt} onFound={onHoldFound} />
          </div>
        ) : null}

        {view.kind === "claim" ? (
          <ClaimPanel
            token={view.token}
            unclaimed={isUnclaimedToken(view.token)}
            onBack={() => goHome()}
            onClaimed={() => {
              goHome();
            }}
          />
        ) : null}

        {view.kind === "foreign" ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <AuthenticCardPanel token={view.token} liveConfirmed />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HomeView({
  tab,
  onTabChange,
  totalUsd,
  portfolioPending,
  vault,
  copied,
  onCopy,
  onReceive,
  onSend,
  tokens,
  collectibles,
  tokensPending,
  activity,
  activityPending,
  accessories,
  accessoriesPending,
  nfcAgents,
  focusedPasskey,
  onPickAccessory,
  onHoldToAdd,
  onPickToken,
  onPickCollectible,
  onPrefetchActivity,
}: {
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  totalUsd: number | null | undefined;
  portfolioPending: boolean;
  vault: string;
  copied: boolean;
  onCopy: () => void;
  onReceive: () => void;
  onSend: () => void;
  tokens: WalletHolding[];
  collectibles: WalletHolding[];
  tokensPending: boolean;
  activity: WalletActivityItem[];
  activityPending: boolean;
  accessories: PhygitalTokenWire[];
  accessoriesPending: boolean;
  nfcAgents: AgentSessionDetail[];
  focusedPasskey: string | null;
  onPickAccessory: (accessory: PhygitalTokenWire) => void;
  onHoldToAdd: () => void;
  onPickToken: (holding: WalletHolding) => void;
  onPickCollectible: (holding: WalletHolding) => void;
  onPrefetchActivity: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-4 pt-2 pb-3 md:space-y-5 md:pt-3 md:pb-4">
        <div className="text-center">
          {portfolioPending ? (
            <Skeleton className="mx-auto h-10 w-40 md:h-12 md:w-48" />
          ) : (
            <p className="text-4xl font-semibold tracking-tight tabular-nums text-foreground md:text-5xl">
              {formatUsd(totalUsd)}
            </p>
          )}
          {vault ? (
            <button
              type="button"
              onClick={onCopy}
              className="mt-2 inline-flex min-h-9 items-center gap-1.5 px-1 font-mono text-xs text-muted-foreground hover:text-foreground md:text-sm"
            >
              {copied ? "Copied" : shortAddress(vault, 4)}
              <Copy className="size-3" />
            </button>
          ) : null}
        </div>

        <div className="flex justify-center gap-8 md:gap-10">
          <ActionButton
            icon={<ArrowUpRight />}
            label="Send"
            onClick={onSend}
          />
          <ActionButton
            icon={<ArrowDownLeft />}
            label="Receive"
            onClick={onReceive}
          />
        </div>

        <AccessoriesBlock
          accessories={accessories}
          pending={accessoriesPending}
          nfcAgents={nfcAgents}
          focusedPasskey={focusedPasskey}
          onPick={onPickAccessory}
          onHoldToAdd={onHoldToAdd}
        />
      </div>

      <Separator />

      <Tabs
        value={tab}
        onValueChange={(v) => onTabChange(v as PanelTab)}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="overflow-x-auto py-2">
          <TabsList variant="line" className="w-full min-w-[20rem]">
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
            <TabsTrigger value="collectibles">Collectibles</TabsTrigger>
            <TabsTrigger value="activity" onMouseEnter={onPrefetchActivity}>
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <TabsContent value="tokens" className="mt-0 py-2">
            {tokensPending ? (
              <TokenSkeletonList />
            ) : tokens.length === 0 ? (
              <EmptyState
                title="No tokens yet"
                actionLabel="Receive"
                onAction={onReceive}
              />
            ) : (
              <div className="divide-y divide-border/40">
                {tokens.map((holding) => (
                  <TokenRow
                    key={holding.id}
                    holding={holding}
                    onClick={() => onPickToken(holding)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collectibles" className="mt-0 py-3">
            {tokensPending ? (
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="aspect-square rounded-2xl" />
                <Skeleton className="aspect-square rounded-2xl" />
              </div>
            ) : collectibles.length === 0 ? (
              <EmptyState title="No collectibles" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {collectibles.map((holding) => (
                  <button
                    key={holding.id}
                    type="button"
                    onClick={() => onPickCollectible(holding)}
                    className="space-y-2 text-left"
                  >
                    {holding.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={holding.image}
                        alt=""
                        className="aspect-square w-full rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-muted text-xs text-muted-foreground">
                        NFT
                      </div>
                    )}
                    <p className="truncate px-0.5 text-xs font-medium text-foreground">
                      {holding.name || holding.symbol}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-0 py-2">
            {activityPending ? (
              <TokenSkeletonList />
            ) : activity.length === 0 ? (
              <EmptyState title="No activity yet" />
            ) : (
              <ul className="divide-y divide-border/40">
                {activity.map((item) => (
                  <li
                    key={item.signature}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatActivityTime(item.blockTime)}
                        {item.err ? " · Failed" : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

function AccessoriesBlock({
  accessories,
  pending,
  nfcAgents,
  focusedPasskey,
  onPick,
  onHoldToAdd,
}: {
  accessories: PhygitalTokenWire[];
  pending: boolean;
  nfcAgents: AgentSessionDetail[];
  focusedPasskey: string | null;
  onPick: (accessory: PhygitalTokenWire) => void;
  onHoldToAdd: () => void;
}) {
  if (pending && accessories.length === 0) {
    return <Skeleton className="h-16 w-full rounded-xl" />;
  }

  if (accessories.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 px-3 py-3 text-center">
        <p className="text-xs text-muted-foreground">
          Tap your accessory to this phone to add it.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-1"
          onClick={onHoldToAdd}
        >
          <Nfc className="size-3.5" />
          Hold to add
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {accessories.map((accessory) => {
        const spending = nfcSpendingFor(
          nfcAgents,
          accessory.secp256r1PublicKey,
        );
        const focused =
          focusedPasskey === accessory.secp256r1PublicKey;
        return (
          <button
            key={accessory.secp256r1PublicKey}
            type="button"
            onClick={() => onPick(accessory)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left ${
              focused
                ? "border-foreground/40 bg-muted/40"
                : "border-border/50"
            }`}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground">
              <Nfc className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                Accessory
                {focused ? " · Connected just now" : ""}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {spending
                  ? spendRowCaption(spending.actions)
                  : "Turn on tap to pay"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-16 flex-col items-center gap-1.5"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/80 md:size-14 [&_svg]:size-5 md:[&_svg]:size-6">
        {icon}
      </span>
      <span className="text-xs font-medium text-foreground md:text-sm">
        {label}
      </span>
    </button>
  );
}

function TokenRow({
  holding,
  onClick,
}: {
  holding: WalletHolding;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 p-2 text-left hover:bg-muted/30 md:p-3"
    >
      {holding.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={holding.image}
          alt=""
          className="size-9 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-[10px] font-medium uppercase text-muted-foreground">
          {holding.symbol.slice(0, 2)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {holding.name}
        </p>
        <p className="truncate text-xs text-muted-foreground">{holding.symbol}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm tabular-nums text-foreground">
          {formatTokenAmount(holding.uiAmount)}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatUsd(holding.usdValue)}
        </p>
      </div>
    </button>
  );
}

function TokenSkeletonList() {
  return (
    <div className="space-y-3 py-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-14" />
          </div>
          <Skeleton className="h-3.5 w-12" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
