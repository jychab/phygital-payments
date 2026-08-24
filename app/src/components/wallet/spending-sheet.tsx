"use client";

import { useMemo, useState } from "react";
import { Check, LoaderCircle, Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { address } from "@solana/kit";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCreateAgentSession } from "@/hooks/wallet/use-agent-mutations";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { useWalletPortfolio } from "@/hooks/wallet/use-wallet-portfolio";
import {
  daysToSlots,
  MAX_SESSION_ACTIONS,
  type SessionActionDraft,
} from "@/lib/lazorkit/session-action-drafts";
import type { PhygitalTokenWire } from "@/lib/phygital/token-wire";
import { setPhygitalTokenLocked } from "@/lib/queries";
import { AGENT_MAX_TTL_MS } from "@/lib/wallet/agent-policy";
import { tryParseAddress } from "@/lib/solana/address";
import { toUserErrorMessage } from "@/lib/user-errors";
import { shortAddress } from "@/lib/utils";
import { parseUiAmount } from "@/lib/wallet/parse-amount";
import { parseSolAmount } from "@/lib/wallet/sol";
import {
  DEFAULT_SPEND_DAYS,
  DEFAULT_USDC_PER_DAY,
  DEFAULT_USDC_PER_TAP,
  USDC_DECIMALS,
  defaultSpendActions,
  usdcMint,
} from "@/lib/wallet/spend-policy";
import {
  ASSOCIATED_TOKEN_PROGRAM_ADDRESS,
  TOKEN_PROGRAM_ADDRESS,
} from "@/lib/wallet/transfer-asset";

const DURATION_PRESETS = [7, 30] as const;

type TokenDraft = {
  id: string;
  mint: string;
  decimals: string;
  lifetime: string;
  maxPerTx: string;
  recurring: string;
  recurringDays: string;
};

type ProgramDraft = {
  id: string;
  programId: string;
  kind: "allow" | "block";
};

function newId(): string {
  return crypto.randomUUID();
}

function defaultTokenRows(): TokenDraft[] {
  return [
    {
      id: newId(),
      mint: usdcMint(),
      decimals: String(USDC_DECIMALS),
      lifetime: "",
      maxPerTx: String(DEFAULT_USDC_PER_TAP),
      recurring: String(DEFAULT_USDC_PER_DAY),
      recurringDays: "1",
    },
  ];
}

function defaultProgramRows(): ProgramDraft[] {
  return [
    {
      id: newId(),
      programId: String(TOKEN_PROGRAM_ADDRESS),
      kind: "allow",
    },
    {
      id: newId(),
      programId: String(ASSOCIATED_TOKEN_PROGRAM_ADDRESS),
      kind: "allow",
    },
  ];
}

function emptyToken(): TokenDraft {
  return {
    id: newId(),
    mint: "",
    decimals: "6",
    lifetime: "",
    maxPerTx: "",
    recurring: "",
    recurringDays: "1",
  };
}

function parseDays(raw: string, label: string): number {
  const days = Number(raw.trim());
  if (!Number.isInteger(days) || days < 1 || days > 30) {
    throw new Error(`${label} must be between 1 and 30 days.`);
  }
  return days;
}

function parseDecimals(raw: string): number {
  const decimals = Number(raw.trim());
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
    throw new Error("Token decimals must be between 0 and 18.");
  }
  return decimals;
}

function requireMint(raw: string): string {
  const mint = tryParseAddress(raw);
  if (!mint) throw new Error("Enter a valid token mint address.");
  return String(mint);
}

function requireProgram(raw: string): string {
  const programId = tryParseAddress(raw);
  if (!programId) throw new Error("Enter a valid program address.");
  return String(programId);
}

function optionalSol(raw: string, label: string): bigint | null {
  const text = raw.trim();
  if (!text) return null;
  const lamports = parseSolAmount(text);
  if (lamports == null || lamports <= 0n) {
    throw new Error(`Invalid ${label}.`);
  }
  return lamports;
}

function optionalTokenAmount(
  raw: string,
  decimals: number,
  label: string,
): bigint | null {
  const text = raw.trim();
  if (!text) return null;
  const amount = parseUiAmount(text, decimals);
  if (amount == null || amount <= 0n) {
    throw new Error(`Invalid ${label}.`);
  }
  return amount;
}

export function SpendingSheet({
  accessory,
  onCancel,
  onSuccess,
}: {
  accessory: PhygitalTokenWire;
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const createAgent = useCreateAgentSession();
  const { session } = useSmartWallet();
  const queryClient = useQueryClient();
  const portfolioQuery = useWalletPortfolio(session?.vaultPda ?? null);

  const [mode, setMode] = useState<"recommended" | "custom">("recommended");
  const [days, setDays] = useState(DEFAULT_SPEND_DAYS);
  const [solLifetime, setSolLifetime] = useState("");
  const [solMaxPerTx, setSolMaxPerTx] = useState("");
  const [solRecurring, setSolRecurring] = useState("");
  const [solRecurringDays, setSolRecurringDays] = useState("1");
  const [tokens, setTokens] = useState<TokenDraft[]>(defaultTokenRows);
  const [programs, setPrograms] = useState<ProgramDraft[]>(defaultProgramRows);
  const [programDraft, setProgramDraft] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const mintSuggestions = useMemo(
    () =>
      (portfolioQuery.data?.tokens ?? []).filter(
        (token) => token.kind === "fungible",
      ),
    [portfolioQuery.data?.tokens],
  );

  const ruleCount = useMemo(() => {
    let n = 0;
    if (solLifetime.trim()) n += 1;
    if (solMaxPerTx.trim()) n += 1;
    if (solRecurring.trim()) n += 1;
    for (const token of tokens) {
      if (token.lifetime.trim()) n += 1;
      if (token.maxPerTx.trim()) n += 1;
      if (token.recurring.trim()) n += 1;
    }
    return n + programs.length;
  }, [programs.length, solLifetime, solMaxPerTx, solRecurring, tokens]);

  function patchToken(id: string, patch: Partial<TokenDraft>) {
    setTokens((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function resetToRecommended() {
    setDays(DEFAULT_SPEND_DAYS);
    setSolLifetime("");
    setSolMaxPerTx("");
    setSolRecurring("");
    setSolRecurringDays("1");
    setTokens(defaultTokenRows());
    setPrograms(defaultProgramRows());
    setProgramDraft("");
    setValidationError(null);
    setMode("recommended");
  }

  const busy = createAgent.isPending;
  const overCap = mode === "custom" && ruleCount > MAX_SESSION_ACTIONS;
  const error = overCap
    ? `At most ${MAX_SESSION_ACTIONS} rules per accessory.`
    : (validationError ??
      (createAgent.error
        ? toUserErrorMessage(
            createAgent.error,
            "Couldn’t turn on tap to pay. Try again.",
          )
        : null));

  function buildCustomActions(): {
    actions: SessionActionDraft[];
    spendingLimitLamports: string | null;
  } {
    const actions: SessionActionDraft[] = [];

    const lifetime = optionalSol(solLifetime, "SOL lifetime cap");
    if (lifetime) {
      actions.push({ type: "solLimit", remaining: lifetime.toString() });
    }
    const maxPerTx = optionalSol(solMaxPerTx, "SOL per-tap max");
    if (maxPerTx) {
      actions.push({ type: "solMaxPerTx", max: maxPerTx.toString() });
    }
    if (solRecurring.trim()) {
      const recurring = optionalSol(solRecurring, "SOL recurring cap");
      if (!recurring) throw new Error("Invalid SOL recurring cap.");
      actions.push({
        type: "solRecurringLimit",
        limit: recurring.toString(),
        windowSlots: daysToSlots(
          parseDays(solRecurringDays, "SOL window"),
        ).toString(),
      });
    }

    for (const token of tokens) {
      const mint = requireMint(token.mint);
      const decimals = parseDecimals(token.decimals);
      const tokenLifetime = optionalTokenAmount(
        token.lifetime,
        decimals,
        "token lifetime cap",
      );
      const tokenMax = optionalTokenAmount(
        token.maxPerTx,
        decimals,
        "token per-tap max",
      );
      const hasRecurring = token.recurring.trim().length > 0;
      if (!tokenLifetime && !tokenMax && !hasRecurring) {
        throw new Error("Each token needs at least one cap.");
      }
      if (tokenLifetime) {
        actions.push({
          type: "tokenLimit",
          mint,
          remaining: tokenLifetime.toString(),
          decimals,
        });
      }
      if (tokenMax) {
        actions.push({
          type: "tokenMaxPerTx",
          mint,
          max: tokenMax.toString(),
          decimals,
        });
      }
      if (hasRecurring) {
        const recurring = optionalTokenAmount(
          token.recurring,
          decimals,
          "token recurring cap",
        );
        if (!recurring) throw new Error("Invalid token recurring cap.");
        actions.push({
          type: "tokenRecurringLimit",
          mint,
          limit: recurring.toString(),
          decimals,
          windowSlots: daysToSlots(
            parseDays(token.recurringDays, "token window"),
          ).toString(),
        });
      }
    }

    for (const program of programs) {
      const programId = requireProgram(program.programId);
      actions.push(
        program.kind === "allow"
          ? { type: "programWhitelist", programId }
          : { type: "programBlacklist", programId },
      );
    }

    if (actions.length > MAX_SESSION_ACTIONS) {
      throw new Error(`At most ${MAX_SESSION_ACTIONS} rules per accessory.`);
    }

    return {
      actions,
      spendingLimitLamports: lifetime ? lifetime.toString() : null,
    };
  }

  function submit(actions: SessionActionDraft[], durationDays: number) {
    if (!session || busy) return;
    setValidationError(null);
    createAgent.reset();
    createAgent.mutate(
      {
        grantBody: {
          kind: "nfc",
          requireNfc: true,
          phygitalPasskey: accessory.secp256r1PublicKey,
          task: {
            label: "Tap to pay",
            spendingLimitLamports: null,
          },
          actions,
          expiresAtMs: Math.min(
            Date.now() + durationDays * 24 * 60 * 60 * 1000,
            Date.now() + AGENT_MAX_TTL_MS,
          ),
        },
        lockTokenAddress: accessory.isLocked
          ? undefined
          : address(accessory.address),
      },
      {
        onSuccess: () => {
          if (!accessory.isLocked) {
            setPhygitalTokenLocked(queryClient, accessory, true);
          }
          onSuccess();
        },
      },
    );
  }

  function onConfirmRecommended() {
    submit(defaultSpendActions(), DEFAULT_SPEND_DAYS);
  }

  function onConfirmCustom() {
    if (days < 1 || days > 30) {
      setValidationError("Duration must be between 1 and 30 days.");
      return;
    }
    try {
      const built = buildCustomActions();
      submit(built.actions, days);
    } catch (err) {
      setValidationError(
        toUserErrorMessage(err, "Check the spending rules and try again."),
      );
    }
  }

  if (mode === "recommended") {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-foreground">Tap to pay</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Other apps can charge this wallet only while you hold this
            accessory. You can change this later by turning it off and setting
            a new limit.
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 px-4 py-4">
          <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {DEFAULT_USDC_PER_DAY} USDC
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">a day</p>
          <ul className="mt-3 space-y-1.5">
            {[
              `Up to ${DEFAULT_USDC_PER_TAP} USDC per tap`,
              "USDC transfers only",
              `Good for ${DEFAULT_SPEND_DAYS} days`,
            ].map((line) => (
              <li
                key={line}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <Check className="mt-0.5 size-3.5 shrink-0 text-foreground" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button
          type="button"
          className="w-full"
          disabled={busy}
          onClick={onConfirmRecommended}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            "Turn on with Face ID"
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          disabled={busy}
          onClick={() => {
            setValidationError(null);
            setMode("custom");
          }}
        >
          Customize
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={busy}
          onClick={onCancel}
        >
          Not now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-foreground">Customize</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Starts from the recommended USDC limit. Leave a field blank to skip
          that cap. Token mints do not need to be in this wallet yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {ruleCount} of {MAX_SESSION_ACTIONS} rules
        </p>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="-mt-2 px-0"
        disabled={busy}
        onClick={resetToRecommended}
      >
        Use recommended
      </Button>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Duration</p>
        <div className="flex gap-2">
          {DURATION_PRESETS.map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant={days === value ? "default" : "outline"}
              className="flex-1"
              disabled={busy}
              onClick={() => setDays(value)}
            >
              {value} days
            </Button>
          ))}
        </div>
        <Input
          type="number"
          min={1}
          max={30}
          value={days}
          disabled={busy}
          onChange={(e) => setDays(Number(e.target.value))}
          aria-label="Duration in days"
        />
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">SOL</p>
          <p className="text-xs text-muted-foreground">
            Optional. Off by default — recommended pay is USDC only.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="sol-lifetime">Lifetime cap</Label>
          <Input
            id="sol-lifetime"
            value={solLifetime}
            onChange={(e) => setSolLifetime(e.target.value)}
            inputMode="decimal"
            placeholder="1"
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sol-max-tx">Max per tap</Label>
          <Input
            id="sol-max-tx"
            value={solMaxPerTx}
            onChange={(e) => setSolMaxPerTx(e.target.value)}
            inputMode="decimal"
            placeholder="0.5"
            disabled={busy}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="sol-recurring">Recurring cap</Label>
            <Input
              id="sol-recurring"
              value={solRecurring}
              onChange={(e) => setSolRecurring(e.target.value)}
              inputMode="decimal"
              placeholder="1"
              disabled={busy}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sol-window">Every (days)</Label>
            <Input
              id="sol-window"
              type="number"
              min={1}
              max={30}
              value={solRecurringDays}
              onChange={(e) => setSolRecurringDays(e.target.value)}
              disabled={busy}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Tokens</p>
            <p className="text-xs text-muted-foreground">
              Paste any mint. You can deposit that token after this is on.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setTokens((prev) => [...prev, emptyToken()])}
          >
            <Plus className="size-3.5" />
            Add
          </Button>
        </div>

        {tokens.map((token) => (
          <div
            key={token.id}
            className="space-y-2 rounded-xl border border-border/60 p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1 space-y-2">
                <Label htmlFor={`mint-${token.id}`}>Mint</Label>
                <Input
                  id={`mint-${token.id}`}
                  value={token.mint}
                  list={`mints-${token.id}`}
                  onChange={(e) => {
                    const mint = e.target.value;
                    const held = mintSuggestions.find((h) => h.id === mint);
                    patchToken(token.id, {
                      mint,
                      ...(held ? { decimals: String(held.decimals) } : {}),
                    });
                  }}
                  placeholder="Token mint address"
                  disabled={busy}
                  className="font-mono text-xs"
                />
                <datalist id={`mints-${token.id}`}>
                  {mintSuggestions.map((holding) => (
                    <option
                      key={holding.id}
                      value={holding.id}
                      label={`${holding.symbol} · ${shortAddress(holding.id, 4)}`}
                    />
                  ))}
                </datalist>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={busy}
                aria-label="Remove token"
                className="mt-6"
                onClick={() =>
                  setTokens((prev) => prev.filter((row) => row.id !== token.id))
                }
              >
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`decimals-${token.id}`}>Decimals</Label>
              <Input
                id={`decimals-${token.id}`}
                type="number"
                min={0}
                max={18}
                value={token.decimals}
                onChange={(e) =>
                  patchToken(token.id, { decimals: e.target.value })
                }
                disabled={busy}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor={`token-life-${token.id}`}>Lifetime</Label>
                <Input
                  id={`token-life-${token.id}`}
                  value={token.lifetime}
                  onChange={(e) =>
                    patchToken(token.id, { lifetime: e.target.value })
                  }
                  inputMode="decimal"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`token-max-${token.id}`}>Max per tap</Label>
                <Input
                  id={`token-max-${token.id}`}
                  value={token.maxPerTx}
                  onChange={(e) =>
                    patchToken(token.id, { maxPerTx: e.target.value })
                  }
                  inputMode="decimal"
                  disabled={busy}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor={`token-rec-${token.id}`}>Recurring cap</Label>
                <Input
                  id={`token-rec-${token.id}`}
                  value={token.recurring}
                  onChange={(e) =>
                    patchToken(token.id, { recurring: e.target.value })
                  }
                  inputMode="decimal"
                  disabled={busy}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`token-win-${token.id}`}>Every (days)</Label>
                <Input
                  id={`token-win-${token.id}`}
                  type="number"
                  min={1}
                  max={30}
                  value={token.recurringDays}
                  onChange={(e) =>
                    patchToken(token.id, { recurringDays: e.target.value })
                  }
                  disabled={busy}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Programs</p>
          <p className="text-xs text-muted-foreground">
            Recommended allows token transfers and token accounts only.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={programDraft}
            onChange={(e) => setProgramDraft(e.target.value)}
            placeholder="Program address"
            disabled={busy}
            className="font-mono text-xs"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !programDraft.trim()}
            onClick={() => {
              setPrograms((prev) => [
                ...prev,
                {
                  id: newId(),
                  programId: programDraft.trim(),
                  kind: "allow",
                },
              ]);
              setProgramDraft("");
            }}
          >
            Allow
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !programDraft.trim()}
            onClick={() => {
              setPrograms((prev) => [
                ...prev,
                {
                  id: newId(),
                  programId: programDraft.trim(),
                  kind: "block",
                },
              ]);
              setProgramDraft("");
            }}
          >
            Block
          </Button>
        </div>
        {programs.map((program) => (
          <div
            key={program.id}
            className="flex items-center gap-2 rounded-lg border border-border/50 px-2 py-1.5"
          >
            <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-foreground">
              {program.kind === "allow" ? "Allow" : "Block"} ·{" "}
              {shortAddress(program.programId, 4)}
            </p>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={busy}
              aria-label="Remove program"
              onClick={() =>
                setPrograms((prev) =>
                  prev.filter((row) => row.id !== program.id),
                )
              }
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {error ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="flex-1"
          disabled={busy || overCap}
          onClick={onConfirmCustom}
        >
          {busy ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            "Confirm with Face ID"
          )}
        </Button>
      </div>
    </div>
  );
}
