import "server-only";

import { resolvePaymentToken } from "@/lib/tokens/payment-token";
import { fetchVerifiedTokens } from "@/lib/server/verified-tokens";
import { errorCopy } from "@/lib/copy/phygital";
import { toUserFacingBody } from "@/lib/user-errors";
import {
  successPreauthCopy,
  type PreauthStatusResult,
} from "../../../shared/preauth-status";

function jsonResponse(
  payload: unknown,
  status: number,
  headers: Headers,
): Response {
  return new Response(JSON.stringify(payload), { status, headers });
}

/**
 * Overlay Shortcuts `body` on every preauth status payload.
 * Success uses catalog decimals/symbol; errors use user-facing copy.
 */
export async function withMintDisplayCopy(res: Response): Promise<Response> {
  const payload = (await res.json()) as Record<string, unknown>;

  if (res.status !== 200) {
    const error =
      typeof payload.error === "string"
        ? payload.error
        : errorCopy.fallback.body;
    return jsonResponse(
      { ...payload, status:"error", body: toUserFacingBody(error) },
      res.status,
      res.headers,
    );
  }

  const result = payload as unknown as PreauthStatusResult;
  if (result.status !== "success") {
    return jsonResponse(result, 200, res.headers);
  }

  try {
    const catalog = await fetchVerifiedTokens();
    const token = resolvePaymentToken(result.mint, catalog);
    return jsonResponse(
      { ...result, ...successPreauthCopy(result, token) },
      200,
      res.headers,
    );
  } catch {
    return jsonResponse(result, 200, res.headers);
  }
}
