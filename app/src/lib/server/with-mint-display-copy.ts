import "server-only";

import { resolvePaymentToken } from "@/lib/tokens/payment-token";
import { fetchVerifiedTokens } from "@/lib/server/verified-tokens";
import {
  successPreauthCopy,
  type PreauthStatusResult,
} from "../../../shared/preauth-status";

/**
 * Overlay catalog decimals/symbol onto a terminal success status so Shortcuts
 * notifications don't assume USDC. Cancelled / expired copy is already final.
 */
export async function withMintDisplayCopy(res: Response): Promise<Response> {
  if (res.status !== 200) return res;

  const result = (await res.json()) as PreauthStatusResult;
  if (result.status !== "success") {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: res.headers,
    });
  }

  try {
    const catalog = await fetchVerifiedTokens();
    const token = resolvePaymentToken(result.mint, catalog);
    return new Response(
      JSON.stringify({
        ...result,
        ...successPreauthCopy(result, token),
      }),
      { status: 200, headers: res.headers },
    );
  } catch {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: res.headers,
    });
  }
}
