import {
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  getTransactionDecoder,
  pipe,
  setTransactionMessageComputeUnitLimit,
  setTransactionMessageComputeUnitPrice,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type Instruction,
  type Signature,
  type Base64EncodedWireTransaction,
} from "@solana/kit";

import { getSolanaRpc } from "@/solana/rpc";
import {
  COMPUTE_UNIT_MARGIN,
  MAX_COMPUTE_UNITS,
  PRIORITY_FEE_MICRO_LAMPORTS,
} from "@/shared/compute-budget";
import { base64ToBytes } from "@/shared/base64";

/** Blockhash lifetime shape accepted by the transaction builder. */
export type BlockhashLifetime = Parameters<
  typeof setTransactionMessageLifetimeUsingBlockhash
>[0];

export async function fetchLatestBlockhash(): Promise<BlockhashLifetime> {
  const { value } = await getSolanaRpc().getLatestBlockhash().send();
  return value;
}

export class SubmitError extends Error {
  readonly transient: boolean;
  constructor(message: string, transient: boolean) {
    super(message);
    this.name = "SubmitError";
    this.transient = transient;
  }
}

/** Simulate core ixs to size compute units (dummy blockhash; replaceRecentBlockhash). */
export async function estimateSponsoredComputeUnits(
  core: Instruction[],
  feePayer: Address,
): Promise<number> {
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(feePayer, m),
    (m) =>
      setTransactionMessageLifetimeUsingBlockhash(
        {
          blockhash: "11111111111111111111111111111111",
          lastValidBlockHeight: 0n,
        } as BlockhashLifetime,
        m,
      ),
    (m) => appendTransactionMessageInstructions(core, m),
    (m) =>
      setTransactionMessageComputeUnitPrice(PRIORITY_FEE_MICRO_LAMPORTS, m),
    (m) => setTransactionMessageComputeUnitLimit(MAX_COMPUTE_UNITS, m),
  );

  const wire = getBase64EncodedWireTransaction(compileTransaction(message));
  let sim;
  try {
    sim = await getSolanaRpc()
      .simulateTransaction(wire, {
        encoding: "base64",
        sigVerify: false,
        replaceRecentBlockhash: true,
        commitment: "processed",
      })
      .send();
  } catch (error) {
    throw new SubmitError(errorMessage(error, "Simulation RPC failed"), true);
  }

  if (sim.value.err) {
    const logs = sim.value.logs?.join("\n") ?? "";
    throw new SubmitError(
      `Simulation failed: ${JSON.stringify(sim.value.err, (_, v) =>
        typeof v === "bigint" ? v.toString() : v,
      )}${logs ? `\n${logs}` : ""}`,
      false,
    );
  }

  const consumed = Number(sim.value.unitsConsumed ?? 0);
  const sized = Math.ceil(consumed * COMPUTE_UNIT_MARGIN) + 450;
  return Math.min(Math.max(sized, 1), MAX_COMPUTE_UNITS);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isTransientRpcError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("blockhash not found") ||
    m.includes("block height exceeded") ||
    m.includes("node is behind") ||
    m.includes("timed out") ||
    m.includes("timeout") ||
    m.includes("fetch failed") ||
    m.includes("network") ||
    m.includes("429") ||
    m.includes("too many requests") ||
    m.includes("503") ||
    m.includes("502") ||
    m.includes("connection")
  );
}

/** Build an unsigned sponsored wire tx for external fee-payer signing. */
export async function buildSponsoredWireForExternalSign(
  core: Instruction[],
  latestBlockhash: BlockhashLifetime,
  feePayer: Address,
  computeUnitLimit?: number,
): Promise<string> {
  const limit =
    computeUnitLimit ?? (await estimateSponsoredComputeUnits(core, feePayer));
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(feePayer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    (m) => appendTransactionMessageInstructions(core, m),
    (m) =>
      setTransactionMessageComputeUnitPrice(PRIORITY_FEE_MICRO_LAMPORTS, m),
    (m) => setTransactionMessageComputeUnitLimit(limit, m),
  );
  return getBase64EncodedWireTransaction(compileTransaction(message));
}

/** Submit a fully signed wire transaction without waiting for confirmation. */
export async function submitSignedWire(wire: string): Promise<Signature> {
  const decoder = getTransactionDecoder();
  const transaction = decoder.decode(base64ToBytes(wire));
  const signature = getSignatureFromTransaction(transaction);
  try {
    await getSolanaRpc()
      .sendTransaction(wire as Base64EncodedWireTransaction, {
        encoding: "base64",
        skipPreflight: true,
        maxRetries: 0n,
      })
      .send();
  } catch (error) {
    const message = errorMessage(error, "sendTransaction failed");
    throw new SubmitError(message, isTransientRpcError(message));
  }
  return signature;
}
