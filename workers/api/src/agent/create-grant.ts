import { address } from "@solana/kit";

import { bytesToBase64, bytesToBase64Url, base64UrlToBytes } from "@/shared/base64";
import {
  encodeSessionActionDrafts,
  parseSessionActionDrafts,
  type SessionActionDraft,
} from "@/lazorkit/session-action-drafts";
import { isOwnedNfcAccessory } from "@/phygital/nfc-accessory";
import { getMaybePhygitalTokenByPasskey } from "@/phygital/lookup";
import { getSolanaRpc } from "@/solana/rpc";
import { findSessionPda } from "@/lazorkit/session";
import { lazorkitProgramAddress } from "@/lazorkit/constants";
import { getSignerClient } from "@/signer/get-signer-client";
import { toUserErrorMessage } from "@/platform/user-errors";
import {
  AGENT_DEFAULT_TTL_MS,
  AGENT_MAX_TTL_MS,
  SLOTS_PER_DAY,
  type AgentKind,
  type AgentSessionRecord,
} from "./policy";
import {
  deleteRecord,
  getRecordBySession,
  putRecord,
} from "./store";

export class GrantError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GrantError";
    this.status = status;
  }
}

export type CreateGrantInput = {
  vaultPda: string;
  walletPda: string;
  kind?: AgentKind;
  requireNfc?: boolean;
  phygitalPasskey?: string;
  task?: unknown;
  actions?: unknown;
  expiresAtMs?: number;
};

export type CreateGrantResult = {
  kind: AgentSessionRecord["kind"];
  sessionPublicKey: string;
  sessionPda: string;
  sessionKey: string;
  expiresAtSlot: string;
  task: AgentSessionRecord["task"] | null;
  actions: SessionActionDraft[];
  actionsBytes: string | null;
};

function parseTaskPolicy(
  raw: unknown,
): AgentSessionRecord["task"] | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as { label?: unknown; spendingLimitLamports?: unknown };
  if (typeof value.label !== "string" || !value.label.trim()) return null;
  const spendingLimitLamports =
    value.spendingLimitLamports == null
      ? null
      : String(value.spendingLimitLamports);
  return {
    label: value.label.trim().slice(0, 200),
    spendingLimitLamports,
  };
}

function clampExpiresAtMs(raw: number | undefined): number {
  const requested =
    typeof raw === "number" && Number.isFinite(raw)
      ? raw
      : Date.now() + AGENT_DEFAULT_TTL_MS;
  const max = Date.now() + AGENT_MAX_TTL_MS;
  return Math.min(Math.max(requested, Date.now() + 60_000), max);
}

async function createSessionRecord(args: {
  kind: AgentKind;
  vaultPda: string;
  walletPda: string;
  expiresAtMs: number;
  phygitalPasskey?: string;
  task?: AgentSessionRecord["task"];
  actions?: SessionActionDraft[];
  /** Prefetched slot (overlap with token fetch on the grant path). */
  currentSlot?: bigint;
}): Promise<{
  record: AgentSessionRecord;
  sessionKey: Uint8Array;
  actionsBytes: Uint8Array;
}> {
  const slot =
    args.currentSlot ?? BigInt(await getSolanaRpc().getSlot().send());
  const ttlMs = Math.max(args.expiresAtMs - Date.now(), 60_000);
  const expiresAtSlot =
    slot + (BigInt(Math.ceil(ttlMs / 86_400_000)) + 1n) * SLOTS_PER_DAY;

  if (!args.phygitalPasskey) {
    throw new Error("Missing phygital passkey");
  }

  const signer = getSignerClient();
  const provisioned = await signer.createSessionKey({
    phygitalPasskey: args.phygitalPasskey,
    vaultPda: args.vaultPda,
    walletPda: args.walletPda,
    expiresAtSlot: expiresAtSlot.toString(),
  });

  const keyBytes = base64UrlToBytes(provisioned.sessionKey);

  const sessionPda = await findSessionPda({
    walletPda: address(args.walletPda),
    sessionKey: keyBytes,
    programAddress: lazorkitProgramAddress(),
  });
  const actionsBytes = encodeSessionActionDrafts(args.actions);

  return {
    sessionKey: keyBytes,
    actionsBytes,
    record: {
      kind: args.kind,
      vaultPda: args.vaultPda,
      walletPda: args.walletPda,
      sessionPublicKey: provisioned.sessionPublicKey,
      sessionPda: String(sessionPda),
      expiresAtSlot: expiresAtSlot.toString(),
      phygitalPasskey: args.phygitalPasskey,
      task: args.task,
      actions: args.actions?.length ? args.actions : undefined,
    },
  };
}

/**
 * Mint an NFC-only spending grant: validate accessory ownership, provision a
 * session key via the signer worker, and persist the D1 agent record.
 */
export async function createGrant(
  input: CreateGrantInput,
): Promise<CreateGrantResult> {
  const expiresAtMs = clampExpiresAtMs(input.expiresAtMs);

  if (input.kind === "autonomous" || input.requireNfc === false) {
    throw new GrantError("Spending must be bound to an accessory.", 400);
  }

  let actions: SessionActionDraft[] | undefined;
  try {
    actions = parseSessionActionDrafts(input.actions) ?? undefined;
  } catch (error) {
    throw new GrantError(
      toUserErrorMessage(error, "Invalid session actions"),
      400,
    );
  }

  const task = parseTaskPolicy(input.task);
  if (!task) {
    throw new GrantError("Missing spending label", 400);
  }

  if (!input.phygitalPasskey) {
    throw new GrantError("Select an accessory", 400);
  }

  const [token, slotResult] = await Promise.all([
    getMaybePhygitalTokenByPasskey(input.phygitalPasskey),
    getSolanaRpc().getSlot().send(),
  ]);
  if (!token || !isOwnedNfcAccessory(token, input.vaultPda)) {
    throw new GrantError(
      "This accessory must be claimed to your wallet first.",
      403,
    );
  }

  const { record, sessionKey, actionsBytes } = await createSessionRecord({
    kind: "nfc",
    vaultPda: input.vaultPda,
    walletPda: input.walletPda,
    expiresAtMs,
    phygitalPasskey: input.phygitalPasskey,
    task,
    actions,
    currentSlot: BigInt(slotResult),
  });

  await putRecord(record);

  return {
    kind: record.kind,
    sessionPublicKey: record.sessionPublicKey,
    sessionPda: record.sessionPda,
    sessionKey: bytesToBase64Url(sessionKey),
    expiresAtSlot: record.expiresAtSlot,
    task: record.task ?? null,
    actions: record.actions ?? [],
    actionsBytes: actionsBytes.length ? bytesToBase64(actionsBytes) : null,
  };
}

/** Destroy the signer session key (if any) and delete the D1 agent record. */
export async function revokeGrant(args: {
  vaultPda: string;
  sessionPda: string;
}): Promise<void> {
  const record = await getRecordBySession(args.sessionPda);
  if (!record || record.vaultPda !== args.vaultPda) {
    throw new GrantError("Spending limit not found", 404);
  }
  if (record.phygitalPasskey) {
    await getSignerClient().destroySessionKey({
      phygitalPasskey: record.phygitalPasskey,
    });
  }
  await deleteRecord(record);
}
