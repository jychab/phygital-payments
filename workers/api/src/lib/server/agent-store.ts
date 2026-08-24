import { getAppDb } from "./app-db";
import type { AgentSessionRecord } from "./agent-policy";
import type { SessionActionDraft } from "@/lib/lazorkit/session-action-drafts";

type AgentSessionRow = {
  session_pda: string;
  kind: string;
  vault_pda: string;
  wallet_pda: string;
  session_public_key: string;
  expires_at_slot: string;
  phygital_passkey: string | null;
  task_json: string | null;
  actions_json: string | null;
};

function rowToRecord(row: AgentSessionRow): AgentSessionRecord | null {
  if (row.kind !== "nfc" && row.kind !== "autonomous") return null;
  let task: AgentSessionRecord["task"];
  if (row.task_json) {
    try {
      task = JSON.parse(row.task_json) as AgentSessionRecord["task"];
    } catch {
      return null;
    }
  }
  let actions: SessionActionDraft[] | undefined;
  if (row.actions_json) {
    try {
      actions = JSON.parse(row.actions_json) as SessionActionDraft[];
    } catch {
      return null;
    }
  }
  return {
    kind: row.kind,
    vaultPda: row.vault_pda,
    walletPda: row.wallet_pda,
    sessionPublicKey: row.session_public_key,
    sessionPda: row.session_pda,
    expiresAtSlot: row.expires_at_slot,
    phygitalPasskey: row.phygital_passkey ?? undefined,
    task,
    actions,
  };
}

export async function getRecordBySession(
  sessionPda: string,
): Promise<AgentSessionRecord | null> {
  const row = await getAppDb()
    .prepare(`SELECT * FROM agent_sessions WHERE session_pda = ?`)
    .bind(sessionPda)
    .first<AgentSessionRow>();
  return row ? rowToRecord(row) : null;
}

export async function putRecord(record: AgentSessionRecord): Promise<void> {
  await getAppDb()
    .prepare(
      `INSERT INTO agent_sessions (
         session_pda, kind, vault_pda, wallet_pda, session_public_key,
         expires_at_slot, phygital_passkey, task_json,
         actions_json, created_at_ms
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(session_pda) DO UPDATE SET
         kind = excluded.kind,
         vault_pda = excluded.vault_pda,
         wallet_pda = excluded.wallet_pda,
         session_public_key = excluded.session_public_key,
         expires_at_slot = excluded.expires_at_slot,
         phygital_passkey = excluded.phygital_passkey,
         task_json = excluded.task_json,
         actions_json = excluded.actions_json`,
    )
    .bind(
      record.sessionPda,
      record.kind,
      record.vaultPda,
      record.walletPda,
      record.sessionPublicKey,
      record.expiresAtSlot,
      record.phygitalPasskey ?? null,
      record.task ? JSON.stringify(record.task) : null,
      record.actions?.length ? JSON.stringify(record.actions) : null,
      Date.now(),
    )
    .run();
}

export async function getRecordByPhygitalPasskey(
  phygitalPasskey: string,
): Promise<AgentSessionRecord | null> {
  const row = await getAppDb()
    .prepare(`SELECT * FROM agent_sessions WHERE phygital_passkey = ?`)
    .bind(phygitalPasskey)
    .first<AgentSessionRow>();
  return row ? rowToRecord(row) : null;
}

export async function listRecordsByVault(
  vaultPda: string,
): Promise<AgentSessionRecord[]> {
  const { results } = await getAppDb()
    .prepare(`SELECT * FROM agent_sessions WHERE vault_pda = ?`)
    .bind(vaultPda)
    .all<AgentSessionRow>();
  return (results ?? [])
    .map((row) => rowToRecord(row))
    .filter((record): record is AgentSessionRecord => record != null);
}

export async function deleteRecord(
  record: Pick<AgentSessionRecord, "sessionPda">,
): Promise<void> {
  await getAppDb()
    .prepare(`DELETE FROM agent_sessions WHERE session_pda = ?`)
    .bind(record.sessionPda)
    .run();
}
