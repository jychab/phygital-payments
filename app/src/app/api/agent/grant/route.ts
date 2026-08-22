import { address, createKeyPairSignerFromBytes } from "@solana/kit";
import { ed25519 } from "@noble/curves/ed25519.js";

import { bytesToBase64, bytesToBase64Url } from "@/lib/crypto/base64";
import { apiJson } from "@/lib/server/api-response";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { findSessionPda } from "@/lib/lazorkit/session";
import { lazorkitProgramAddress } from "@/lib/lazorkit/constants";
import {
  AGENT_DEFAULT_TTL_MS,
  agentPermissions,
  agentSpendingLimit,
  expiresAtSlotToMs,
  SLOTS_PER_DAY,
  type AgentKind,
  type AgentSessionDetail,
  type AgentTaskPolicy,
} from "@/lib/server/agent-policy";
import {
  deleteMapping,
  getMappingBySession,
  listMappingsByVault,
  putMapping,
  toPublicAgentSession,
  type AgentSessionMapping,
} from "@/lib/server/agent-store";
import { liveSessionPdas } from "@/lib/server/agent-session-live";
import { withVaultQuery } from "@/lib/server/vault-route";
import {
  requireWalletSession,
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/lib/server/wallet-session";
import { toUserErrorMessage } from "@/lib/user-errors";
import { fetchMaybePhygitalTokenByPasskeyCached } from "@/lib/server/phygital-token-lookup";

export const runtime = "nodejs";

function newSessionSecret(): Uint8Array {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const pub = ed25519.getPublicKey(seed);
  const full = new Uint8Array(64);
  full.set(seed, 0);
  full.set(pub, 32);
  return full;
}

function parseTaskPolicy(raw: unknown): AgentTaskPolicy | null {
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

async function enrichMappings(
  mappings: AgentSessionMapping[],
  currentSlot: bigint,
  liveSessions: Set<string>,
): Promise<AgentSessionDetail[]> {
  const live = mappings.filter((m) => liveSessions.has(m.sessionPda));
  const nfcPasskeys = live
    .filter((m) => m.kind === "nfc" && m.phygitalPasskey)
    .map((m) => m.phygitalPasskey!);
  const tokens = await Promise.all(
    nfcPasskeys.map(async (pk) => ({
      pk,
      token: await fetchMaybePhygitalTokenByPasskeyCached(pk),
    })),
  );
  const tokenByPk = new Map(tokens.map(({ pk, token }) => [pk, token]));

  return live.map((mapping) => {
    let hasPhygitalToken: boolean | undefined;
    if (mapping.kind === "nfc" && mapping.phygitalPasskey) {
      const token = tokenByPk.get(mapping.phygitalPasskey);
      hasPhygitalToken = Boolean(
        token && String(token.currentOwner) === mapping.vaultPda,
      );
    }
    const expiresAtSlot = BigInt(mapping.expiresAtSlot);
    return {
      ...toPublicAgentSession(mapping),
      sessionPublicKey: mapping.sessionPublicKey,
      expiresAtSlot: mapping.expiresAtSlot,
      expiresAtMs: expiresAtSlotToMs(expiresAtSlot, currentSlot),
      hasPhygitalToken,
      permissions: agentPermissions({
        kind: mapping.kind,
        task: mapping.task,
      }),
      spendingLimitLamports: agentSpendingLimit({
        kind: mapping.kind,
        task: mapping.task,
      }),
    };
  });
}

async function createSessionMapping(args: {
  kind: AgentKind;
  vaultPda: string;
  walletPda: string;
  expiresAtMs: number;
  phygitalPasskey?: string;
  task?: AgentTaskPolicy;
}): Promise<{
  mapping: AgentSessionMapping;
  sessionKey: Uint8Array;
}> {
  const secret = newSessionSecret();
  const signer = await createKeyPairSignerFromBytes(secret);
  const sessionKey = Uint8Array.from(secret.subarray(32));
  const sessionPda = await findSessionPda({
    walletPda: address(args.walletPda),
    sessionKey,
    programAddress: lazorkitProgramAddress(),
  });
  const slotResult = await getSolanaRpc().getSlot().send();
  const slot = BigInt(slotResult);
  const ttlMs = Math.max(args.expiresAtMs - Date.now(), 60_000);
  const expiresAtSlot =
    slot + (BigInt(Math.ceil(ttlMs / 86_400_000)) + 1n) * SLOTS_PER_DAY;
  return {
    sessionKey,
    mapping: {
      kind: args.kind,
      vaultPda: args.vaultPda,
      walletPda: args.walletPda,
      sessionPublicKey: String(signer.address),
      sessionPda: String(sessionPda),
      sessionSecret: bytesToBase64(secret),
      expiresAtSlot: expiresAtSlot.toString(),
      phygitalPasskey: args.phygitalPasskey,
      task: args.task,
    },
  };
}

export async function GET(req: Request) {
  return withVaultQuery(req, async (vault) => {
    const mappings = await listMappingsByVault(vault);
    const [slotResult, liveSessions] = await Promise.all([
      getSolanaRpc().getSlot().send(),
      liveSessionPdas(mappings.map((m) => m.sessionPda)),
    ]);
    const currentSlot = BigInt(slotResult);
    const agents = await enrichMappings(mappings, currentSlot, liveSessions);
    return { agents };
  });
}

/**
 * Mint a session key and return PDAs for Face ID createSession.
 * NFC agents require a claimed phygital token; autonomous agents require a task policy.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      kind: AgentKind;
      phygitalPasskey?: string;
      task?: unknown;
      expiresAtMs?: number;
    };

    const wallet = await requireWalletSession();
    const vaultPda = String(wallet.vaultPda);
    const expiresAtMs =
      typeof body.expiresAtMs === "number"
        ? body.expiresAtMs
        : Date.now() + AGENT_DEFAULT_TTL_MS;

    if (body.kind !== "nfc" && body.kind !== "autonomous") {
      return apiJson({ error: "Missing agent kind" }, 400);
    }

    const task = parseTaskPolicy(body.task);
    let mapping: AgentSessionMapping;
    let sessionKey: Uint8Array;

    if (body.kind === "autonomous") {
      if (!task) {
        return apiJson({ error: "Missing task for autonomous agent" }, 400);
      }
      ({ mapping, sessionKey } = await createSessionMapping({
        kind: "autonomous",
        vaultPda,
        walletPda: String(wallet.walletPda),
        expiresAtMs,
        task,
      }));
    } else {
      if (!body.phygitalPasskey) {
        return apiJson({ error: "Missing phygital token" }, 400);
      }
      const token = await fetchMaybePhygitalTokenByPasskeyCached(
        body.phygitalPasskey,
      );
      if (!token || String(token.currentOwner) !== vaultPda) {
        return apiJson({ error: "Claim this phygital token to your wallet first." }, 403);
      }
      ({ mapping, sessionKey } = await createSessionMapping({
        kind: "nfc",
        vaultPda,
        walletPda: String(wallet.walletPda),
        expiresAtMs,
        phygitalPasskey: body.phygitalPasskey,
      }));
    }

    await putMapping(mapping);
    return apiJson({
      kind: mapping.kind,
      sessionPublicKey: mapping.sessionPublicKey,
      sessionPda: mapping.sessionPda,
      sessionKey: bytesToBase64Url(sessionKey),
      expiresAtSlot: mapping.expiresAtSlot,
      task: mapping.task ?? null,
    });
  } catch (error) {
    if (error instanceof WalletSessionError) {
      return apiJson({ error: walletSessionErrorMessage(error) }, 401);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t start") }, 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const wallet = await requireWalletSession();
    const vaultPda = String(wallet.vaultPda);
    let sessionPda: string | null = null;
    try {
      const body = (await req.json()) as { sessionPda?: string };
      if (typeof body.sessionPda === "string" && body.sessionPda) {
        sessionPda = body.sessionPda;
      }
    } catch {
      /* no body */
    }

    if (!sessionPda) {
      return apiJson({ error: "Missing session" }, 400);
    }

    const mapping = await getMappingBySession(sessionPda);
    if (!mapping || mapping.vaultPda !== vaultPda) {
      return apiJson({ error: "Agent not found" }, 404);
    }
    await deleteMapping(mapping);
    return apiJson({ ok: true });
  } catch (error) {
    if (error instanceof WalletSessionError) {
      return apiJson({ error: walletSessionErrorMessage(error) }, 401);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t stop") }, 500);
  }
}
