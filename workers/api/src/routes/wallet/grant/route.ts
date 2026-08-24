import { address } from "@solana/kit";

import { bytesToBase64, bytesToBase64Url, base64UrlToBytes } from "@/shared/base64";
import {
  encodeSessionActionDrafts,
  parseSessionActionDrafts,
  type SessionActionDraft,
} from "@/lib/lazorkit/session-action-drafts";
import { isOwnedNfcAccessory } from "@/lib/phygital/nfc-accessory";
import { withApiMetrics } from "@/lib/server/analytics";
import { apiJson } from "@/lib/server/api-response";
import {
  IdempotencyConflictError,
  idempotencyKey,
  readIdempotentResponse,
  requestFingerprint,
  storeIdempotentResponse,
} from "@/lib/server/idempotency";
import { rateLimitOrResponse, rateLimitPresets } from "@/lib/server/rate-limit";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { findSessionPda } from "@/lib/lazorkit/session";
import { lazorkitProgramAddress } from "@/lib/lazorkit/constants";
import {
  AGENT_DEFAULT_TTL_MS,
  AGENT_MAX_TTL_MS,
  SLOTS_PER_DAY,
  type AgentKind,
  type AgentSessionRecord,
} from "@/lib/server/agent-policy";
import {
  deleteRecord,
  getRecordBySession,
  putRecord,
} from "@/lib/server/agent-store";
import { listVaultAgents } from "@/lib/server/list-vault-agents";
import { withVaultQuery } from "@/lib/server/vault-route";
import {
  WalletAuthError,
  walletAuthErrorMessage,
  type WalletAuthAssertionWire,
} from "@/lib/server/wallet-auth";
import { requireWalletAuthStepUp } from "@/lib/server/wallet-auth-step-up";
import {
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/lib/server/wallet-session";
import { getMaybePhygitalTokenByPasskey } from "@/lib/server/phygital-token-lookup";
import { SignerError, signerErrorToHttp } from "@/lib/signer/errors";
import { getSignerClient } from "@/lib/signer/get-signer-client";
import { toUserErrorMessage } from "@/lib/user-errors";

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

export async function GET(req: Request) {
  return withApiMetrics("/api/wallet/grant", async () =>
    withVaultQuery(req, async (vault) => {
      const agents = await listVaultAgents(vault);
      return { agents };
    }),
  );
}

/**
 * Mint a session key and return PDAs for Face ID createSession.
 * NFC-only: accessory must be Controlled and owned by the vault.
 * Lock is applied in the same Execute as createSession when needed.
 */
export async function POST(req: Request) {
  try {
    const limited = await rateLimitOrResponse(
      req,
      rateLimitPresets.walletWrite,
      `grant:post:pre`,
    );
    if (limited) return limited;

    const body = (await req.json()) as {
      walletAuth?: WalletAuthAssertionWire;
      kind?: AgentKind;
      phygitalPasskey?: string;
      requireNfc?: boolean;
      task?: unknown;
      actions?: unknown;
      expiresAtMs?: number;
    };

    const wallet = await requireWalletAuthStepUp(req, body.walletAuth);
    const limitedVault = await rateLimitOrResponse(
      req,
      rateLimitPresets.walletWrite,
      `grant:post:${String(wallet.vaultPda)}`,
    );
    if (limitedVault) return limitedVault;

    const idemKey = idempotencyKey(req);
    if (idemKey) {
      const cached = await readIdempotentResponse<Record<string, unknown>>(
        "/api/wallet/grant",
        idemKey,
      );
      if (cached) return apiJson(cached);
    }

    const vaultPda = String(wallet.vaultPda);
    const expiresAtMs = clampExpiresAtMs(body.expiresAtMs);

    if (body.kind === "autonomous" || body.requireNfc === false) {
      return apiJson(
        { error: "Spending must be bound to an accessory." },
        400,
      );
    }

    let actions: SessionActionDraft[] | undefined;
    try {
      actions = parseSessionActionDrafts(body.actions) ?? undefined;
    } catch (error) {
      return apiJson(
        { error: toUserErrorMessage(error, "Invalid session actions") },
        400,
      );
    }

    const task = parseTaskPolicy(body.task);
    if (!task) {
      return apiJson({ error: "Missing spending label" }, 400);
    }

    if (!body.phygitalPasskey) {
      return apiJson({ error: "Select an accessory" }, 400);
    }
    const [token, slotResult] = await Promise.all([
      getMaybePhygitalTokenByPasskey(body.phygitalPasskey),
      getSolanaRpc().getSlot().send(),
    ]);
    if (!token || !isOwnedNfcAccessory(token, vaultPda)) {
      return apiJson(
        {
          error: "This accessory must be claimed to your wallet first.",
        },
        403,
      );
    }
    const phygitalPasskey = body.phygitalPasskey;

    const { record, sessionKey, actionsBytes } = await createSessionRecord({
      kind: "nfc",
      vaultPda,
      walletPda: String(wallet.walletPda),
      expiresAtMs,
      phygitalPasskey,
      task,
      actions,
      currentSlot: BigInt(slotResult),
    });

    await putRecord(record);
    const response = {
      kind: record.kind,
      sessionPublicKey: record.sessionPublicKey,
      sessionPda: record.sessionPda,
      sessionKey: bytesToBase64Url(sessionKey),
      expiresAtSlot: record.expiresAtSlot,
      task: record.task ?? null,
      actions: record.actions ?? [],
      actionsBytes: actionsBytes.length
        ? bytesToBase64(actionsBytes)
        : null,
    };
    if (idemKey) {
      await storeIdempotentResponse(
        "/api/wallet/grant",
        idemKey,
        requestFingerprint(body),
        response,
      );
    }
    return apiJson(response);
  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      return apiJson({ error: error.message }, 409);
    }
    if (error instanceof WalletSessionError) {
      return apiJson({ error: walletSessionErrorMessage(error) }, 401);
    }
    if (error instanceof WalletAuthError) {
      return apiJson({ error: walletAuthErrorMessage(error) }, 401);
    }
    if (error instanceof SignerError) {
      const mapped = signerErrorToHttp(error);
      return apiJson({ error: mapped.message }, mapped.status);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t start") }, 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const limited = await rateLimitOrResponse(
      req,
      rateLimitPresets.walletWrite,
      `grant:delete:pre`,
    );
    if (limited) return limited;

    let sessionPda: string | null = null;
    let walletAuth: WalletAuthAssertionWire | undefined;
    try {
      const body = (await req.json()) as {
        sessionPda?: string;
        walletAuth?: WalletAuthAssertionWire;
      };
      walletAuth = body.walletAuth;
      if (typeof body.sessionPda === "string" && body.sessionPda) {
        sessionPda = body.sessionPda;
      }
    } catch {
      /* no body */
    }

    const wallet = await requireWalletAuthStepUp(req, walletAuth);
    const limitedVault = await rateLimitOrResponse(
      req,
      rateLimitPresets.walletWrite,
      `grant:delete:${String(wallet.vaultPda)}`,
    );
    if (limitedVault) return limitedVault;

    const vaultPda = String(wallet.vaultPda);

    if (!sessionPda) {
      return apiJson({ error: "Missing session" }, 400);
    }

    const record = await getRecordBySession(sessionPda);
    if (!record || record.vaultPda !== vaultPda) {
      return apiJson({ error: "Spending limit not found" }, 404);
    }
    if (record.phygitalPasskey) {
      await getSignerClient().destroySessionKey({
        phygitalPasskey: record.phygitalPasskey,
      });
    }
    await deleteRecord(record);
    return apiJson({ ok: true });
  } catch (error) {
    if (error instanceof WalletSessionError) {
      return apiJson({ error: walletSessionErrorMessage(error) }, 401);
    }
    if (error instanceof WalletAuthError) {
      return apiJson({ error: walletAuthErrorMessage(error) }, 401);
    }
    if (error instanceof SignerError) {
      const mapped = signerErrorToHttp(error);
      return apiJson({ error: mapped.message }, mapped.status);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t stop") }, 500);
  }
}
