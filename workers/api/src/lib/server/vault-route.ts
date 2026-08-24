import { address } from "@solana/kit";

import { apiJson } from "@/lib/server/api-response";
import { rateLimitOrResponse, rateLimitPresets } from "@/lib/server/rate-limit";
import {
  requireVaultSession,
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/lib/server/wallet-session";
import { toUserErrorMessage } from "@/lib/user-errors";

export async function withVaultQuery(
  req: Request,
  handler: (vault: string) => Promise<unknown | Response>,
): Promise<Response> {
  const vault = new URL(req.url).searchParams.get("vault");
  const limited = await rateLimitOrResponse(
    req,
    rateLimitPresets.walletRead,
    `vault:${vault ?? "unknown"}`,
  );
  if (limited) return limited;
  if (!vault) {
    return apiJson({ error: "Missing vault" }, 400);
  }
  try {
    address(vault);
    await requireVaultSession(vault);
    const result = await handler(vault);
    if (result instanceof Response) return result;
    return apiJson(result);
  } catch (error) {
    if (error instanceof WalletSessionError) {
      return apiJson({ error: walletSessionErrorMessage(error) }, 401);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t load") }, 500);
  }
}
