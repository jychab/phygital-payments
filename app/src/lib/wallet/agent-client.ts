import { address, type Address } from "@solana/kit";

import { base64ToBytes, base64UrlToBytes } from "@/lib/crypto/base64";
import { executeAsVault } from "@/lib/lazorkit/execute-as-vault";
import { buildCreateSessionInner } from "@/lib/lazorkit/session";
import type { SmartWalletSession } from "@/lib/lazorkit/credential-store";
import { lockAccessoryForVault } from "@/lib/phygital/lock";
import { queryFetch, readJson } from "@/lib/queries";
import { fetchWalletAuthProof } from "@/lib/wallet/wallet-auth-client";

export async function createAgentSessionOnChain(args: {
  session: SmartWalletSession;
  grantBody: Record<string, unknown>;
  lockTokenAddress?: Address;
}): Promise<void> {
  const walletAuth = await fetchWalletAuthProof(args.session);
  const setupRes = await queryFetch("/api/wallet/grant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...args.grantBody, walletAuth }),
  });
  const setup = await readJson<{
    sessionPda: string;
    sessionKey: string;
    expiresAtSlot: string;
    actionsBytes: string | null;
  }>(setupRes, "Couldn’t start");
  const actions =
    setup.actionsBytes != null && setup.actionsBytes.length > 0
      ? base64ToBytes(setup.actionsBytes)
      : undefined;
  const inner = [
    ...(args.lockTokenAddress
      ? [
          lockAccessoryForVault({
            token: args.lockTokenAddress,
            vaultPda: args.session.vaultPda,
          }),
        ]
      : []),
    buildCreateSessionInner({
      vaultPda: args.session.vaultPda,
      walletPda: args.session.walletPda,
      authorityPda: args.session.authorityPda,
      sessionPda: address(setup.sessionPda),
      sessionKey: base64UrlToBytes(setup.sessionKey),
      expiresAtSlot: BigInt(setup.expiresAtSlot),
      actions,
    }),
  ];
  await executeAsVault({
    session: args.session,
    inner,
  });
}
