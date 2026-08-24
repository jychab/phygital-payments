import { address } from "@solana/kit";

import { getSolanaRpc } from "@/lib/solana/rpc";
import { lazorkitProgramAddress } from "@/lib/lazorkit/constants";

const GMA_CHUNK = 100;

/** Session PDAs that still exist on-chain under the LazorKit program. */
export async function liveSessionPdas(
  sessionPdas: readonly string[],
): Promise<Set<string>> {
  const unique = [...new Set(sessionPdas)];
  if (unique.length === 0) return new Set();

  const program = String(lazorkitProgramAddress());
  const rpc = getSolanaRpc();
  const live = new Set<string>();

  const chunks: Array<Promise<void>> = [];
  for (let offset = 0; offset < unique.length; offset += GMA_CHUNK) {
    const chunk = unique.slice(offset, offset + GMA_CHUNK);
    chunks.push(
      (async () => {
        const { value } = await rpc
          .getMultipleAccounts(
            chunk.map((pda) => address(pda)),
            {
              encoding: "base64",
              dataSlice: { offset: 0, length: 0 },
            },
          )
          .send();
        value.forEach((info, index) => {
          if (info && info.owner === program) {
            live.add(chunk[index]!);
          }
        });
      })(),
    );
  }
  await Promise.all(chunks);
  return live;
}
