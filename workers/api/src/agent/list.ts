import { isOwnedNfcAccessory } from "@/phygital/nfc-accessory";
import {
  fetchMaybePhygitalTokensByPasskeys,
  type PhygitalToken,
} from "@/phygital/token";
import {
  expiresAtSlotToMs,
  type AgentSessionDetail,
  type AgentSessionRecord,
} from "@/agent/policy";
import { liveSessionPdas } from "@/agent/session-live";
import { listRecordsByVault } from "@/agent/store";
import { getSolanaRpc } from "@/solana/rpc";

export type ListVaultAgentsOptions = {
  /**
   * When set (value or Promise), NFC ownership uses this set instead of
   * on-chain token fetches. A Promise lets callers overlap accessory GPA with
   * D1/slot/session checks.
   */
  ownedPasskeys?:
    | ReadonlySet<string>
    | Promise<ReadonlySet<string> | undefined>
    | undefined;
};

function nfcPasskeysOf(records: AgentSessionRecord[]): string[] {
  const keys = new Set<string>();
  for (const record of records) {
    if (record.kind === "nfc" && record.phygitalPasskey) {
      keys.add(record.phygitalPasskey);
    }
  }
  return [...keys];
}

function enrichRecords(
  records: AgentSessionRecord[],
  currentSlot: bigint,
  liveSessions: Set<string>,
  ownedPasskeys: ReadonlySet<string> | undefined,
  tokenByPk: Map<string, PhygitalToken | null> | undefined,
): AgentSessionDetail[] {
  return records
    .filter((record) => liveSessions.has(record.sessionPda))
    .map((record) => {
      let hasPhygitalToken: boolean | undefined;
      if (record.kind === "nfc" && record.phygitalPasskey) {
        if (ownedPasskeys) {
          hasPhygitalToken = ownedPasskeys.has(record.phygitalPasskey);
        } else {
          const token = tokenByPk?.get(record.phygitalPasskey) ?? null;
          hasPhygitalToken = Boolean(
            token && isOwnedNfcAccessory(token, record.vaultPda),
          );
        }
      }
      return {
        ...record,
        expiresAtMs: expiresAtSlotToMs(BigInt(record.expiresAtSlot), currentSlot),
        hasPhygitalToken,
      };
    });
}

/** Live agent sessions for a vault (on-chain check + NFC ownership flags). */
export async function listVaultAgents(
  vault: string,
  options?: ListVaultAgentsOptions,
): Promise<AgentSessionDetail[]> {
  const recordsPromise = listRecordsByVault(vault);
  const slotPromise = getSolanaRpc().getSlot().send();
  const ownedPromise = Promise.resolve(options?.ownedPasskeys);

  const records = await recordsPromise;
  const nfcPasskeys = nfcPasskeysOf(records);

  // Overlap token GMA with live-session GMA when ownership isn't supplied
  // (Grant GET). Prefetch all NFC passkeys on records; enrich filters to live.
  const tokensPromise = ownedPromise.then(async (owned) => {
    if (owned || nfcPasskeys.length === 0) return undefined;
    return fetchMaybePhygitalTokensByPasskeys(getSolanaRpc(), nfcPasskeys);
  });

  const [slotResult, liveSessions, ownedPasskeys, tokenByPk] = await Promise.all(
    [
      slotPromise,
      liveSessionPdas(records.map((record) => record.sessionPda)),
      ownedPromise,
      tokensPromise,
    ],
  );

  return enrichRecords(
    records,
    BigInt(slotResult),
    liveSessions,
    ownedPasskeys,
    tokenByPk,
  );
}
