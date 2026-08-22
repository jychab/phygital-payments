export const AGENT_DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const CHALLENGE_TTL_MS = 2 * 60 * 1000;
export const CHALLENGE_KV_TTL_SEC = Math.ceil(CHALLENGE_TTL_MS / 1000) + 30;
export const SLOTS_PER_DAY = 216_000n;
export const MS_PER_SLOT = 86_400_000 / Number(SLOTS_PER_DAY);

export type AgentKind = "nfc" | "autonomous";

/** Policy for a self-running agent (e.g. DCA via Jupiter). */
export type AgentTaskPolicy = {
  label: string;
  spendingLimitLamports: string | null;
};

export type AgentSessionPublic = {
  kind: AgentKind;
  vaultPda: string;
  walletPda: string;
  sessionPda: string;
  phygitalPasskey?: string;
  task?: AgentTaskPolicy;
};

export type AgentSessionDetail = AgentSessionPublic & {
  sessionPublicKey: string;
  expiresAtSlot: string;
  /** Approximate wall-clock expiry from current slot. */
  expiresAtMs: number;
  /** Phygital token still claimed to this wallet (NFC agents only). */
  hasPhygitalToken?: boolean;
  permissions: readonly string[];
  spendingLimitLamports: string | null;
};

export const AGENT_BASE_PERMISSIONS = [
  "Execute approved transactions for this wallet",
  "Gas sponsored — no SOL needed for fees",
] as const;

export const AGENT_NFC_PERMISSION =
  "Require NFC tap before each signature";

export const AGENT_AUTONOMOUS_PERMISSION =
  "Sign on schedule without NFC tap";

export function expiresAtSlotToMs(
  expiresAtSlot: bigint,
  currentSlot: bigint,
): number {
  const remaining = expiresAtSlot - currentSlot;
  if (remaining <= 0n) return Date.now();
  return Date.now() + Number(remaining) * MS_PER_SLOT;
}

export function agentPermissions(args: {
  kind: AgentKind;
  task?: AgentTaskPolicy;
}): readonly string[] {
  if (args.kind === "nfc") {
    return [...AGENT_BASE_PERMISSIONS, AGENT_NFC_PERMISSION];
  }
  const perms: string[] = [
    ...AGENT_BASE_PERMISSIONS,
    AGENT_AUTONOMOUS_PERMISSION,
  ];
  if (args.task?.label) {
    perms.push(`Task: ${args.task.label}`);
  }
  return perms;
}

export function agentSpendingLimit(args: {
  kind: AgentKind;
  task?: AgentTaskPolicy;
}): string | null {
  if (args.kind === "autonomous") {
    return args.task?.spendingLimitLamports ?? null;
  }
  return null;
}
