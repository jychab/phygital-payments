import "server-only";

import { address } from "@solana/kit";

import { apiJson } from "@/lib/server/api-response";
import {
  requireVaultSession,
  walletSessionErrorMessage,
  WalletSessionError,
} from "@/lib/server/wallet-session";
import { toUserErrorMessage } from "@/lib/user-errors";

export class VaultRouteError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "VaultRouteError";
  }
}

export async function withVaultQuery(
  req: Request,
  handler: (vault: string) => Promise<unknown>,
): Promise<Response> {
  const vault = new URL(req.url).searchParams.get("vault");
  if (!vault) {
    return apiJson({ error: "Missing vault" }, 400);
  }
  try {
    address(vault);
    await requireVaultSession(vault);
    return apiJson(await handler(vault));
  } catch (error) {
    if (error instanceof WalletSessionError) {
      return apiJson({ error: walletSessionErrorMessage(error) }, 401);
    }
    if (error instanceof VaultRouteError) {
      return apiJson({ error: error.message }, error.status);
    }
    return apiJson({ error: toUserErrorMessage(error, "Couldn’t load") }, 500);
  }
}
