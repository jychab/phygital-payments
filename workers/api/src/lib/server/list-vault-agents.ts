import { isOwnedNfcAccessory } from "@/lib/phygital/nfc-accessory";
import {
  fetchMaybePhygitalTokensByPasskeys,
  type PhygitalToken,
} from "@/lib/phygital/token";
import {
  expiresAtSlotToMs,
  type AgentSessionDetail,
  type AgentSessionRecord,
} from "@/lib/server/agent-policy";
import { liveSessionPdas } from "@/lib/server/agent-session-live";
import { listRecordsByVault } from "@/lib/server/agent-store";
import { getSolanaRpc } from "@/lib/solana/rpc";

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

async function enrichRecords(
  records: AgentSessionRecord[],
  currentSlot: bigint,
  liveSessions: Set<string>,
  ownedPasskeys?: ReadonlySet<string>,
): Promise<AgentSessionDetail[]> {
  const live = records.filter((record) => liveSessions.has(record.sessionPda));
  const nfcPasskeys = live
    .filter((record) => record.kind === "nfc" && record.phygitalPasskey)
    .map((record) => record.phygitalPasskey!);

  let tokenByPk: Map<string, PhygitalToken | null> | undefined;
  if (!ownedPasskeys && nfcPasskeys.length > 0) {
    tokenByPk = await fetchMaybePhygitalTokensByPasskeys(
      getSolanaRpc(),
      nfcPasskeys,
    );
  }

  return live.map((record) => {
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
  const [slotResult, liveSessions, ownedPasskeys] = await Promise.all([
    slotPromise,
    liveSessionPdas(records.map((record) => record.sessionPda)),
    ownedPromise,
  ]);
  return enrichRecords(
    records,
    BigInt(slotResult),
    liveSessions,
    ownedPasskeys,
  );
}
