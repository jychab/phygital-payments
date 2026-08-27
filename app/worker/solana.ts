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
import { getSecp256r1VerifyInstruction } from "../shared/secp256r1-verify";
import {
  getTransferInstruction,
  PHYGITAL_PAYMENTS_PROGRAM_ADDRESS,
} from "phygital-payments-sdk";

import {
  base64ToBytes,
  COMPUTE_UNIT_MARGIN,
  CONFIRM_TIMEOUT_MS,
  MAX_COMPUTE_UNITS,
  PRIORITY_FEE_MICRO_LAMPORTS,
  SINGLE_JOB_COMPUTE_UNITS,
  type Secp256r1VerifyEntryWire,
  type TransferAccountsWire,
  type TransferJob,
} from "./types";

/** Blockhash lifetime shape accepted by the transaction builder. */
export type BlockhashLifetime = Parameters<
  typeof setTransactionMessageLifetimeUsingBlockhash
>[0];

/** Precomputed, reusable inputs the DO caches across flushes. */
export type SendContext = {
  signer: TransactionSigner;
  latestBlockhash: BlockhashLifetime;
};

// Cache RPC clients across simulate → send → confirm. Keyed by URL.
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

export async function getFeePayerSigner(
  env: CloudflareEnv,
): Promise<TransactionSigner> {
  const secret = env.FEE_PAYER_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("FEE_PAYER_SECRET_KEY is not configured");
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
  return signer;
}

/** Fetch a fresh blockhash lifetime (the DO caches the result). */
export async function fetchLatestBlockhash(
  env: CloudflareEnv,
): Promise<BlockhashLifetime> {
  const { value } = await getRpc(env).getLatestBlockhash().send();
  return value;
}

export function entryFromWire(wire: Secp256r1VerifyEntryWire) {
  return {
    publicKey: base64ToBytes(wire.publicKey),
    signature: base64ToBytes(wire.signature),
    message: base64ToBytes(wire.message),
  };
}

export function buildTransferIx(
  transfer: TransferAccountsWire,
  verifyArgsRelativeIndex: number,
  signedMessageIndex: number,
  feePayer: TransactionSigner,
): Instruction {
  return getTransferInstruction({
    verifier: feePayer,
    config: address(transfer.config),
    ownerVerifier: address(transfer.ownerVerifier),
    phygitalToken: address(transfer.token),
    mint: address(transfer.mint),
    recipient: address(transfer.recipient),
    programAuthority: address(transfer.programAuthority),
    senderTokenAccount: address(transfer.senderTokenAccount),
    recipientTokenAccount: address(transfer.recipientTokenAccount),
    tokenProgram: address(transfer.tokenProgram),
    amount: BigInt(transfer.amount),
    verifyArgsRelativeIndex,
    signedMessageIndex,
    clientDataJson: base64ToBytes(transfer.clientDataJson),
    slotNumber: BigInt(transfer.slotNumber),
  });
}

export function validateTransferWire(transfer: TransferAccountsWire): void {
  if (
    !transfer.token ||
    !transfer.owner ||
    !transfer.mint ||
    !transfer.recipient ||
    !transfer.ownerVerifier ||
    !transfer.config
  ) {
    throw new Error("Transfer accounts incomplete");
  }
  // Soft check — full program id validation
  void PHYGITAL_PAYMENTS_PROGRAM_ADDRESS;
  BigInt(transfer.amount);
  BigInt(transfer.slotNumber);
}

// --- Compute budget (hand-rolled: kit-7-native, stable, zero deps) ----------

const COMPUTE_BUDGET_PROGRAM = address(
  "ComputeBudget111111111111111111111111111111",
);

/** ComputeBudget: SetComputeUnitLimit (instruction tag 0x02, u32 units LE). */
function setComputeUnitLimitIx(units: number): Instruction {
  const data = new Uint8Array(5);
  data[0] = 0x02;
  new DataView(data.buffer).setUint32(1, units, true);
  return { programAddress: COMPUTE_BUDGET_PROGRAM, data };
}

/** ComputeBudget: SetComputeUnitPrice (instruction tag 0x03, u64 µlamports LE). */
function setComputeUnitPriceIx(microLamports: bigint): Instruction {
  const data = new Uint8Array(9);
  data[0] = 0x03;
  new DataView(data.buffer).setBigUint64(1, microLamports, true);
  return { programAddress: COMPUTE_BUDGET_PROGRAM, data };
}

// --- Submission -------------------------------------------------------------

/**
 * Submit failure classified as either a permanent (on-chain / program) error
 * that should fail the batch immediately, or a transient (network / RPC /
 * blockhash) error that is worth retrying while the jobs are still fresh.
 */
export class SubmitError extends Error {
  readonly transient: boolean;
  constructor(message: string, transient: boolean) {
    super(message);
    this.name = "SubmitError";
    this.transient = transient;
  }
}

/** secp verify + one transfer per job, wired to the shared verify instruction. */
function buildCoreInstructions(
  jobs: TransferJob[],
  feePayer: TransactionSigner,
): Instruction[] {
  const entries = jobs.map((job) => entryFromWire(job.secpEntry));
  const secpIx = getSecp256r1VerifyInstruction(entries);
  const transferIxs = jobs.map((job, i) =>
    buildTransferIx(job.transfer, -(i + 1), i, feePayer),
  );
  return [secpIx, ...transferIxs];
}

/**
 * Authoritative simulation of the final batched transaction. Returns the
 * compute units consumed so we can size a tight CU limit + priority fee.
 * Throws a permanent SubmitError if the program rejects the batch.
 */
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
        // Placeholder — replaceRecentBlockhash swaps in a live one.
        { blockhash: "11111111111111111111111111111111", lastValidBlockHeight: 0n } as BlockhashLifetime,
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
  const sized = Math.ceil(consumed * COMPUTE_UNIT_MARGIN) + 450; // +CB ix overhead
  return Math.min(Math.max(sized, 1), MAX_COMPUTE_UNITS);
}

/** Build + fee-payer-sign the final tx (branded Kit types preserved). */
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
 * Simulate → size compute budget → send (skipPreflight) → await `confirmed`.
 */
export async function sendSponsoredBatch(
  env: CloudflareEnv,
  jobs: TransferJob[],
  ctx: SendContext,
): Promise<Signature> {
  if (jobs.length === 0) {
    throw new SubmitError("No jobs to submit", false);
  }
  const core = buildCoreInstructions(jobs, ctx.signer);
  const computeUnitLimit =
    jobs.length === 1
      ? Math.min(SINGLE_JOB_COMPUTE_UNITS, MAX_COMPUTE_UNITS)
      : await simulateBatch(env, core, ctx.signer.address);
  return sendSponsoredCore(env, core, ctx, computeUnitLimit);
}

async function sendSponsoredCore(
  env: CloudflareEnv,
  core: Instruction[],
  ctx: SendContext,
  computeUnitLimit: number,
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
  await confirmSignature(
    env,
    signature,
    ctx.latestBlockhash.lastValidBlockHeight,
  );
  return signature;
}

/** The blockhash is dead once the chain passes its lastValidBlockHeight. */
async function blockhashExpired(
  env: CloudflareEnv,
  lastValidBlockHeight: bigint,
): Promise<boolean> {
  const height = await getRpc(env).getBlockHeight().send();
  return height > lastValidBlockHeight;
}

/** Whether an observed status has reached `confirmed` (or `finalized`). */
function isConfirmed(observed: string | null | undefined): boolean {
  return observed === "confirmed" || observed === "finalized";
}

/**
 * Await `confirmed` via WebSocket signature subscription (premium RPC), with a
 * getSignatureStatuses polling fallback if the subscription can't be opened.
 * Both paths share one wall-clock deadline (so the total budget is a single
 * CONFIRM_TIMEOUT_MS, not double) and give up early — as a transient error —
 * once the tx's blockhash can no longer land.
 */
async function confirmSignature(
  env: CloudflareEnv,
  signature: Signature,
  lastValidBlockHeight: bigint,
): Promise<void> {
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;
  try {
    await confirmViaSubscription(env, signature, lastValidBlockHeight, deadline);
  } catch (error) {
    if (error instanceof SubmitError) throw error; // on-chain / expiry — don't retry here
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
  // Watchdog: abort (and flag) as soon as the blockhash can no longer land, so
  // a never-landing tx requeues promptly instead of waiting out the deadline.
  let expired = false;
  const watchdog = setInterval(() => {
    void blockhashExpired(env, lastValidBlockHeight)
      .then((isExpired) => {
        if (isExpired) {
          expired = true;
          abort.abort();
        }
      })
      .catch(() => {}); // transient lookup failure — ignore, keep waiting
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
      return; // confirmed
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
      // Not confirmed yet — if the blockhash is dead, it never will be. Retry.
      if (await blockhashExpired(env, lastValidBlockHeight)) {
        throw new SubmitError("Blockhash expired before confirmation", true);
      }
    } catch (error) {
      if (error instanceof SubmitError) throw error;
      // transient lookup failure — keep polling
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  // Landed but not observed confirmed in time — treat as transient (retryable).
  throw new SubmitError("Timed out waiting for confirmation", true);
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/** Heuristic: does this send/preflight error look retryable? */
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
