import "server-only";

import { getAppKv } from "./app-kv";
import { createKvChallengeStore } from "./kv-challenge-store";
import type { AgentKind, AgentSessionPublic, AgentTaskPolicy } from "./agent-policy";

export type AgentSessionMapping = {
  kind: AgentKind;
  vaultPda: string;
  walletPda: string;
  sessionPublicKey: string;
  sessionPda: string;
  sessionSecret: string;
  expiresAtSlot: string;
  /** NFC agents: passkey bound to external-app tap flow. */
  phygitalPasskey?: string;
  /** Autonomous agents: task policy (e.g. DCA swap). */
  task?: AgentTaskPolicy;
};

function vaultAgentsKey(vaultPda: string): string {
  return `agent:vault:${vaultPda}:agents`;
}

function sessionKey(sessionPda: string): string {
  return `agent:session:${sessionPda}`;
}

function phygitalPasskeyKey(phygitalPasskey: string): string {
  return `agent:phygital:${phygitalPasskey}`;
}

export type NfcChallenge = {
  requestId: string;
  /** Pass to `startAuthentication(challenge)`. */
  challenge: string;
  origin: string;
  createdAtMs: number;
  expiresAtMs: number;
  consumed: boolean;
};

const nfcChallengeStore = createKvChallengeStore<NfcChallenge>("agent:challenge");

function normalizeMapping(raw: unknown): AgentSessionMapping | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<AgentSessionMapping>;
  if (
    !value.kind ||
    !value.sessionPda ||
    !value.vaultPda ||
    !value.walletPda ||
    !value.sessionPublicKey ||
    !value.sessionSecret ||
    !value.expiresAtSlot
  ) {
    return null;
  }
  return {
    kind: value.kind,
    vaultPda: value.vaultPda,
    walletPda: value.walletPda,
    sessionPublicKey: value.sessionPublicKey,
    sessionPda: value.sessionPda,
    sessionSecret: value.sessionSecret,
    expiresAtSlot: value.expiresAtSlot,
    phygitalPasskey: value.phygitalPasskey,
    task: value.task,
  };
}

async function readVaultAgents(vaultPda: string): Promise<AgentSessionMapping[]> {
  const raw = await getAppKv().get(vaultAgentsKey(vaultPda));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => normalizeMapping(entry))
      .filter((mapping): mapping is AgentSessionMapping => mapping != null);
  } catch {
    return [];
  }
}

async function writeVaultAgents(
  vaultPda: string,
  mappings: AgentSessionMapping[],
): Promise<void> {
  const key = vaultAgentsKey(vaultPda);
  if (mappings.length === 0) {
    await getAppKv().delete(key);
    return;
  }
  await getAppKv().put(key, JSON.stringify(mappings));
}

export async function getMappingBySession(
  sessionPda: string,
): Promise<AgentSessionMapping | null> {
  const raw = await getAppKv().get(sessionKey(sessionPda));
  return raw ? normalizeMapping(JSON.parse(raw)) : null;
}

export async function putMapping(mapping: AgentSessionMapping): Promise<void> {
  const body = JSON.stringify(mapping);
  const writes: Promise<void>[] = [
    getAppKv().put(sessionKey(mapping.sessionPda), body),
  ];

  const agents = await readVaultAgents(mapping.vaultPda);
  const nextAgents = [
    ...agents.filter((entry) => entry.sessionPda !== mapping.sessionPda),
    mapping,
  ];
  writes.push(writeVaultAgents(mapping.vaultPda, nextAgents));

  if (mapping.kind === "nfc" && mapping.phygitalPasskey) {
    writes.push(
      getAppKv().put(
        phygitalPasskeyKey(mapping.phygitalPasskey),
        mapping.sessionPda,
      ),
    );
  }

  await Promise.all(writes);
}

export async function getMappingByPhygitalPasskey(
  phygitalPasskey: string,
): Promise<AgentSessionMapping | null> {
  const raw = await getAppKv().get(phygitalPasskeyKey(phygitalPasskey));
  if (!raw) return null;
  return getMappingBySession(raw);
}

export async function listMappingsByVault(
  vaultPda: string,
): Promise<AgentSessionMapping[]> {
  return readVaultAgents(vaultPda);
}

export async function deleteMapping(
  mapping: AgentSessionMapping,
): Promise<void> {
  const agents = await readVaultAgents(mapping.vaultPda);
  await Promise.all([
    getAppKv().delete(sessionKey(mapping.sessionPda)),
    writeVaultAgents(
      mapping.vaultPda,
      agents.filter((entry) => entry.sessionPda !== mapping.sessionPda),
    ),
    mapping.kind === "nfc" && mapping.phygitalPasskey
      ? getAppKv().delete(phygitalPasskeyKey(mapping.phygitalPasskey))
      : Promise.resolve(),
  ]);
}

export async function putChallenge(
  challenge: NfcChallenge,
  ttlSeconds: number,
): Promise<void> {
  await nfcChallengeStore.put(challenge, ttlSeconds);
}

export async function getChallenge(
  requestId: string,
): Promise<NfcChallenge | null> {
  return nfcChallengeStore.get(requestId);
}

/** Mark a challenge used so a second /sign cannot replay it. */
export async function takeChallenge(
  requestId: string,
): Promise<NfcChallenge | null> {
  return nfcChallengeStore.take(requestId);
}

export function toPublicAgentSession(
  mapping: AgentSessionMapping,
): AgentSessionPublic {
  return {
    kind: mapping.kind,
    vaultPda: mapping.vaultPda,
    walletPda: mapping.walletPda,
    sessionPda: mapping.sessionPda,
    phygitalPasskey: mapping.phygitalPasskey,
    task: mapping.task,
  };
}
