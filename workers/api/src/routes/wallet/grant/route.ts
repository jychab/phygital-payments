import { withApiMetrics } from "@/platform/analytics";
import { apiJson } from "@/platform/api-response";
import {
  IdempotencyConflictError,
  idempotencyKey,
  readIdempotentResponse,
  requestFingerprint,
  storeIdempotentResponse,
} from "@/platform/idempotency";
import { rateLimitOrResponse, rateLimitPresets } from "@/platform/rate-limit";
import {
  createGrant,
  GrantError,
  revokeGrant,
} from "@/agent/create-grant";
import { listVaultAgents } from "@/agent/list";
import type { AgentKind } from "@/agent/policy";
import { withVaultQuery } from "@/wallet/vault-query";
import {
  WalletAuthError,
  walletAuthErrorMessage,
  type WalletAuthAssertionWire,
} from "@/wallet/auth";
import { requireWalletAuthStepUp } from "@/wallet/auth-step-up";
import {
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/wallet/session";
import { SignerError, signerErrorToHttp } from "@/signer/errors";
import { toUserErrorMessage } from "@/platform/user-errors";

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

    const response = await createGrant({
      vaultPda: String(wallet.vaultPda),
      walletPda: String(wallet.walletPda),
      kind: body.kind,
      requireNfc: body.requireNfc,
      phygitalPasskey: body.phygitalPasskey,
      task: body.task,
      actions: body.actions,
      expiresAtMs: body.expiresAtMs,
    });

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
    if (error instanceof GrantError) {
      return apiJson({ error: error.message }, error.status);
    }
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

    if (!sessionPda) {
      return apiJson({ error: "Missing session" }, 400);
    }

    await revokeGrant({
      vaultPda: String(wallet.vaultPda),
      sessionPda,
    });
    return apiJson({ ok: true });
  } catch (error) {
    if (error instanceof GrantError) {
      return apiJson({ error: error.message }, error.status);
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
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t stop") }, 500);
  }
}
