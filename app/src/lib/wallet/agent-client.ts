import { address } from "@solana/kit";
import type { QueryClient } from "@tanstack/react-query";

import { base64UrlToBytes } from "@/lib/crypto/base64";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { buildCreateSessionInner } from "@/lib/lazorkit/session";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";
import { queryFetch, queryKeys, readJson } from "@/lib/queries";

type GrantSetupResponse = {
  sessionPda: string;
  sessionKey: string;
  expiresAtSlot: string;
};

export async function createAgentSessionOnChain(args: {
  session: SmartWalletSession;
  grantBody: Record<string, unknown>;
  queryClient: QueryClient;
}): Promise<void> {
  const setupRes = await queryFetch("/api/agent/grant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(args.grantBody),
  });
  const setup = await readJson<GrantSetupResponse>(setupRes, "Couldn’t start");
  await executeAsVault({
    session: args.session,
    inner: [
      buildCreateSessionInner({
        vaultPda: args.session.vaultPda,
        walletPda: args.session.walletPda,
        authorityPda: args.session.authorityPda,
        sessionPda: address(setup.sessionPda),
        sessionKey: base64UrlToBytes(setup.sessionKey),
        expiresAtSlot: BigInt(setup.expiresAtSlot),
      }),
    ],
  });
  await args.queryClient.invalidateQueries({
    queryKey: queryKeys.agentSession.byVault(String(args.session.vaultPda)),
  });
}
