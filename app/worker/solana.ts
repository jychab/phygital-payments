import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getBase58Encoder,
  getBase64EncodedWireTransaction,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Address,
  type Instruction,
  type Rpc,
  type Signature,
  type SolanaRpcApi,
  type TransactionSigner,
} from "@solana/kit";

import {
  defaultComputeBudgetIxs,
  setComputeUnitLimitIx,
  setComputeUnitPriceIx,
} from "../shared/compute-budget";
import {
  COMPUTE_UNIT_MARGIN,
  CONFIRM_TIMEOUT_MS,
  MAX_COMPUTE_UNITS,
  PRIORITY_FEE_MICRO_LAMPORTS,
} from "./types";

/** Blockhash lifetime shape accepted by the transaction builder. */
export type BlockhashLifetime = Parameters<
  typeof setTransactionMessageLifetimeUsingBlockhash
>[0];

/** Precomputed, reusable inputs for a sponsored submit. */
export type SendContext = {
  signer: TransactionSigner;
  latestBlockhash: BlockhashLifetime;
};

let rpcCache: { url: string; rpc: Rpc<SolanaRpcApi> } | undefined;
let rpcSubscriptionsCache:
  | { url: string; subs: ReturnType<typeof createSolanaRpcSubscriptions> }
  | undefined;

export function getRpc(env: CloudflareEnv): Rpc<SolanaRpcApi> {
  const url = env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (rpcCache?.url !== url) {
    rpcCache = { url, rpc: createSolanaRpc(url) };
  }
  return rpcCache.rpc;
}

export function getRpcSubscriptions(env: CloudflareEnv) {
  const url = env.NEXT_PUBLIC_SOLANA_RPC_URL.replace(/^http/, "ws");
  if (rpcSubscriptionsCache?.url !== url) {
    rpcSubscriptionsCache = { url, subs: createSolanaRpcSubscriptions(url) };
  }
  return rpcSubscriptionsCache.subs;
}

let feePayerSignerCache:
  | { secret: string; signer: TransactionSigner }
  | undefined;

export async function getFeePayerSigner(
  env: CloudflareEnv,
): Promise<TransactionSigner> {
  const secret = env.FEE_PAYER_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("FEE_PAYER_SECRET_KEY is not configured");
  }
  if (feePayerSignerCache?.secret === secret) {
    return feePayerSignerCache.signer;
  }
  const bytes = secret.startsWith("[")
    ? Uint8Array.from(JSON.parse(secret) as number[])
    : new Uint8Array(getBase58Encoder().encode(secret));
  const signer = await createKeyPairSignerFromBytes(bytes);
  if (
    env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY &&
    signer.address !== address(env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY)
  ) {
    throw new Error(
      "FEE_PAYER_SECRET_KEY does not match NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY",
    );
  }
  feePayerSignerCache = { secret, signer };
  return signer;
}

export async function fetchLatestBlockhash(
  env: CloudflareEnv,
): Promise<BlockhashLifetime> {
  const { value } = await getRpc(env).getLatestBlockhash().send();
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

async function simulateBatch(
  env: CloudflareEnv,
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
    (m) =>
      appendTransactionMessageInstructions(
        [
          setComputeUnitPriceIx(PRIORITY_FEE_MICRO_LAMPORTS),
          setComputeUnitLimitIx(MAX_COMPUTE_UNITS),
          ...core,
        ],
        m,
      ),
  );

  const wire = getBase64EncodedWireTransaction(compileTransaction(message));
  let sim;
  try {
    sim = await getRpc(env)
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
      `Simulation failed: ${JSON.stringify(sim.value.err)}${logs ? `\n${logs}` : ""}`,
      false,
    );
  }

  const consumed = Number(sim.value.unitsConsumed ?? 0);
  const sized = Math.ceil(consumed * COMPUTE_UNIT_MARGIN) + 450;
  return Math.min(Math.max(sized, 1), MAX_COMPUTE_UNITS);
}

async function buildAndSign(
  ctx: SendContext,
  computeUnitLimit: number,
  core: Instruction[],
) {
  const signed = await pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(ctx.signer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(ctx.latestBlockhash, m),
    (m) =>
      appendTransactionMessageInstructions(
        [
          setComputeUnitPriceIx(PRIORITY_FEE_MICRO_LAMPORTS),
          setComputeUnitLimitIx(computeUnitLimit),
          ...core,
        ],
        m,
      ),
    (m) => signTransactionMessageWithSigners(m),
  );
  return {
    signature: getSignatureFromTransaction(signed),
    wire: getBase64EncodedWireTransaction(signed),
  };
}

/**
 * Simulate, fee-payer-sign, and confirm an already-built instruction list
 * (LazorKit createWallet / Execute).
 */
export async function sendSponsoredInstructions(
  env: CloudflareEnv,
  core: Instruction[],
  ctx: SendContext,
  opts?: { confirm?: boolean },
): Promise<Signature> {
  if (core.length === 0) {
    throw new SubmitError("No instructions to submit", false);
  }
  const computeUnitLimit = await simulateBatch(env, core, ctx.signer.address);
  return sendSponsoredCore(env, core, ctx, computeUnitLimit, opts?.confirm !== false);
}

async function sendSponsoredCore(
  env: CloudflareEnv,
  core: Instruction[],
  ctx: SendContext,
  computeUnitLimit: number,
  confirm = true,
): Promise<Signature> {
  let built: Awaited<ReturnType<typeof buildAndSign>>;
  try {
    built = await buildAndSign(ctx, computeUnitLimit, core);
  } catch (error) {
    throw new SubmitError(
      errorMessage(error, "Failed to build transaction"),
      true,
    );
  }
  const { signature, wire } = built;
  try {
    await getRpc(env)
      .sendTransaction(wire, {
        encoding: "base64",
        skipPreflight: true,
        maxRetries: 0n,
      })
      .send();
  } catch (error) {
    const message = errorMessage(error, "sendTransaction failed");
    throw new SubmitError(message, isTransientRpcError(message));
  }
  if (confirm) {
    await confirmSignature(
      env,
      signature,
      ctx.latestBlockhash.lastValidBlockHeight,
    );
  }
  return signature;
}

async function blockhashExpired(
  env: CloudflareEnv,
  lastValidBlockHeight: bigint,
): Promise<boolean> {
  const height = await getRpc(env).getBlockHeight().send();
  return height > lastValidBlockHeight;
}

function isConfirmed(observed: string | null | undefined): boolean {
  return observed === "confirmed" || observed === "finalized";
}

async function confirmSignature(
  env: CloudflareEnv,
  signature: Signature,
  lastValidBlockHeight: bigint,
): Promise<void> {
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;
  try {
    await confirmViaSubscription(env, signature, lastValidBlockHeight, deadline);
  } catch (error) {
    if (error instanceof SubmitError) throw error;
    await confirmViaPolling(env, signature, lastValidBlockHeight, deadline);
  }
}

async function confirmViaSubscription(
  env: CloudflareEnv,
  signature: Signature,
  lastValidBlockHeight: bigint,
  deadline: number,
): Promise<void> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), Math.max(0, deadline - Date.now()));
  let expired = false;
  const watchdog = setInterval(() => {
    void blockhashExpired(env, lastValidBlockHeight)
      .then((isExpired) => {
        if (isExpired) {
          expired = true;
          abort.abort();
        }
      })
      .catch(() => {});
  }, 2000);
  try {
    const notifications = await getRpcSubscriptions(env)
      .signatureNotifications(signature, { commitment: "confirmed" })
      .subscribe({ abortSignal: abort.signal });
    for await (const notification of notifications) {
      if (notification.value?.err) {
        throw new SubmitError(
          `Transaction failed: ${JSON.stringify(notification.value.err)}`,
          false,
        );
      }
      return;
    }
    if (expired) {
      throw new SubmitError("Blockhash expired before confirmation", true);
    }
    throw new Error("Subscription closed before confirmation");
  } finally {
    clearTimeout(timer);
    clearInterval(watchdog);
    abort.abort();
  }
}

async function confirmViaPolling(
  env: CloudflareEnv,
  signature: Signature,
  lastValidBlockHeight: bigint,
  deadline: number,
): Promise<void> {
  const rpc = getRpc(env);
  while (Date.now() < deadline) {
    try {
      const { value } = await rpc
        .getSignatureStatuses([signature], { searchTransactionHistory: true })
        .send();
      const status = value[0];
      if (status?.err) {
        throw new SubmitError(
          `Transaction failed: ${JSON.stringify(status.err)}`,
          false,
        );
      }
      if (isConfirmed(status?.confirmationStatus)) {
        return;
      }
      if (await blockhashExpired(env, lastValidBlockHeight)) {
        throw new SubmitError("Blockhash expired before confirmation", true);
      }
    } catch (error) {
      if (error instanceof SubmitError) throw error;
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new SubmitError("Timed out waiting for confirmation", true);
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

export function assertFeePayerConfigured(env: CloudflareEnv): Address {
  if (!env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY?.trim()) {
    throw new Error("NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY is not configured");
  }
  return address(env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY.trim());
}
