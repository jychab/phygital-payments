import "server-only";

import { address } from "@solana/kit";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { lazorkitProgramAddress } from "@/lib/lazorkit/constants";

/** Session PDAs that still exist on-chain under the LazorKit program. */
export async function liveSessionPdas(
  sessionPdas: readonly string[],
): Promise<Set<string>> {
  if (sessionPdas.length === 0) return new Set();
  const program = String(lazorkitProgramAddress());
  const { value } = await getSolanaRpc()
    .getMultipleAccounts(sessionPdas.map((pda) => address(pda)), {
      encoding: "base64",
    })
    .send();
  const live = new Set<string>();
  value.forEach((info, index) => {
    if (info && info.owner === program) {
      live.add(sessionPdas[index]!);
    }
  });
  return live;
}
