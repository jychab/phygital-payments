import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type Instruction,
} from "@solana/kit";

import { getSolanaRpc } from "@/lib/solana/rpc";

type BlockhashLifetime = Parameters<
  typeof setTransactionMessageLifetimeUsingBlockhash
>[0];

export function getSponsoredFeePayerAddress(): Address {
  const raw = process.env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim();
  if (!raw) {
    throw new Error("Sponsored submit is not configured");
  }
  return address(raw);
}

/**
 * Simulate an unsigned sponsored tx (sigVerify off, live blockhash).
 * Call after building the same instruction list the DO will submit.
 */
export async function simulateSponsoredInstructions(
  instructions: Instruction[],
  feePayer: Address = getSponsoredFeePayerAddress(),
): Promise<void> {
  if (instructions.length === 0) {
    throw new Error("Nothing to submit");
  }

  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(feePayer, m),
    (m) =>
      setTransactionMessageLifetimeUsingBlockhash(
        // Placeholder — replaceRecentBlockhash swaps in a live one.
        {
          blockhash: "11111111111111111111111111111111",
          lastValidBlockHeight: 0n,
        } as BlockhashLifetime,
        m,
      ),
    (m) => appendTransactionMessageInstructions(instructions, m),
  );

  const wire = getBase64EncodedWireTransaction(compileTransaction(message));
  const sim = await getSolanaRpc()
    .simulateTransaction(wire, {
      encoding: "base64",
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: "processed",
    })
    .send();

  if (sim.value.err) {
    const logs = sim.value.logs?.join("\n") ?? "";
    const detail = logs
      ? `Transaction would fail on-chain:\n${logs}`
      : `Transaction would fail on-chain: ${JSON.stringify(sim.value.err)}`;
    console.error("[payment:simulate]", {
      err: sim.value.err,
      logs: sim.value.logs,
    });
    throw new Error(detail);
  }
}
