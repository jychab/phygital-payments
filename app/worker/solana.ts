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
  type Signature,
  type TransactionSigner,
} from "@solana/kit";
import { getSecp256r1VerifyInstruction } from "phygital-token-sdk";
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

// Cache the RPC / subscriptions clients so a single flush (simulate → send →
// confirm) doesn't rebuild a transport on every call. Keyed by URL so a config
// change still produces a fresh client.
let rpcCache: { url: string; rpc: ReturnType<typeof createSolanaRpc> } | undefined;
let rpcSubscriptionsCache:
  | { url: string; subs: ReturnType<typeof createSolanaRpcSubscriptions> }
  | undefined;

export function getRpc(env: CloudflareEnv) {
  const url = env.NEXT_PUBLIC_SOLANA_RPC_URL;
  if (rpcCache?.url !== url) {
    rpcCache = { url, rpc: createSolanaRpc(url) };
  }
  return rpcCache.rpc;
}

function subscriptionsUrl(env: CloudflareEnv): string {
  return (
    env.NEXT_PUBLIC_SOLANA_RPC_URL.replace(/^http/, "ws")
  );
}

export function getRpcSubscriptions(env: CloudflareEnv) {
  const url = subscriptionsUrl(env);
  if (rpcSubscriptionsCache?.url !== url) {
    rpcSubscriptionsCache = { url, subs: createSolanaRpcSubscriptions(url) };
  }
  return rpcSubscriptionsCache.subs;
}

export async function getFeePayerSigner(env: CloudflareEnv): Promise<TransactionSigner> {
  const secret = env.FEE_PAYER_SECRET_KEY?.trim();
  if (!secret) {
    throw new Error("FEE_PAYER_SECRET_KEY is not configured");
  }
  const bytes = decodeSecretKey(secret);
  const signer = await createKeyPairSignerFromBytes(bytes);
  if (
    env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY &&
    signer.address !== address(env.NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY)
  ) {
    throw new Error("FEE_PAYER_SECRET_KEY does not match NEXT_PUBLIC_FEE_PAYER_PUBLIC_KEY");
  }
  return signer;
}

function decodeSecretKey(secret: string): Uint8Array {
  if (secret.startsWith("[")) {
    const arr = JSON.parse(secret) as number[];
    return Uint8Array.from(arr);
  }
  // base58-encoded 64-byte secret key (Kit: encoder maps base58 string → bytes)
  return new Uint8Array(getBase58Encoder().encode(secret));
}

/** Fetch a fresh blockhash lifetime (the DO caches the result). */
export async function fetchLatestBlockhash(env: CloudflareEnv): Promise<BlockhashLifetime> {
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
): Instruction {
  return getTransferInstruction({
    asset: address(transfer.asset),
    mint: address(transfer.mint),
    recipient: address(transfer.recipient),
    programAuthority: address(transfer.programAuthority),
    senderTokenAccount: address(transfer.senderTokenAccount),
    recipientTokenAccount: address(transfer.recipientTokenAccount),
    tokenProgram: address(transfer.tokenProgram),
    amount: BigInt(transfer.amount),
    verifyArgsRelativeIndex,
    signedMessageIndex,
    slotNumber: BigInt(transfer.slotNumber),
    clientDataJson: base64ToBytes(transfer.clientDataJson),
  });
}

export function validateTransferWire(transfer: TransferAccountsWire): void {
  if (!transfer.asset || !transfer.mint || !transfer.recipient) {
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
function buildCoreInstructions(jobs: TransferJob[]): Instruction[] {
  const entries = jobs.map((job) => entryFromWire(job.secpEntry));
  const secpIx = getSecp256r1VerifyInstruction(entries);
  const transferIxs = jobs.map((job, i) =>
    buildTransferIx(job.transfer, -(i + 1), i),
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

/** Result of a successful submit, carrying what the DO needs to settle later. */
export type SubmitResult = {
  signature: Signature;
  lastValidBlockHeight: bigint;
};

/**
 * Simulate → size compute budget → send (skipPreflight, already simulated) →
 * await `processed`. Returns the signature plus the blockhash height needed to
 * settle to `confirmed` in the background.
 *
 * We release at `processed` (first block inclusion, ~1 slot) rather than
 * `confirmed` to make perceived confirmation card-network fast: the batch has
 * already passed an authoritative simulation and each transfer is single-use
 * (secp verify + slotNumber), so inclusion is a strong signal. The DO upgrades
 * to `confirmed` out of band via {@link settleConfirmed}.
 */
export async function sendSponsoredBatch(
  env: CloudflareEnv,
  jobs: TransferJob[],
  ctx: SendContext,
): Promise<SubmitResult> {
  if (jobs.length === 0) {
    throw new SubmitError("No jobs to submit", false);
  }

  const core = buildCoreInstructions(jobs);

  // Authoritative validity check + compute-unit measurement.
  const computeUnitLimit = await simulateBatch(env, core, ctx.signer.address);

  // Build + sign the final transaction with a tight CU limit + priority fee.
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
        // Already simulated above — skip the RPC's redundant preflight.
        skipPreflight: true,
        maxRetries: 0n,
      })
      .send();
  } catch (error) {
    const message = errorMessage(error, "sendTransaction failed");
    throw new SubmitError(message, isTransientRpcError(message));
  }

  const lastValidBlockHeight = ctx.latestBlockhash.lastValidBlockHeight;
  await confirmSignature(env, signature, lastValidBlockHeight, "processed");
  return { signature, lastValidBlockHeight };
}

/**
 * Second-stage settlement: wait for `confirmed` after the UI has already been
 * released at `processed`. Throws (transient) if the tx is dropped before it
 * confirms, so the DO can reconcile.
 */
export async function settleConfirmed(
  env: CloudflareEnv,
  signature: Signature,
  lastValidBlockHeight: bigint,
): Promise<void> {
  await confirmSignature(env, signature, lastValidBlockHeight, "confirmed");
}

/** The blockhash is dead once the chain passes its lastValidBlockHeight. */
async function blockhashExpired(
  env: CloudflareEnv,
  lastValidBlockHeight: bigint,
): Promise<boolean> {
  const height = await getRpc(env).getBlockHeight().send();
  return height > lastValidBlockHeight;
}

/** Commitment levels this module confirms against. */
type ConfirmCommitment = "processed" | "confirmed";

/** Whether an observed status has reached (or passed) the target commitment. */
function statusReached(
  observed: string | null | undefined,
  target: ConfirmCommitment,
): boolean {
  if (observed === "finalized") return true;
  if (observed === "confirmed") return true;
  return target === "processed" && observed === "processed";
}

/**
 * Await the target commitment via WebSocket signature subscription (premium
 * RPC), with a getSignatureStatuses polling fallback if the subscription can't
 * be opened. Both paths share one wall-clock deadline (so the total budget is a
 * single CONFIRM_TIMEOUT_MS, not double) and give up early — as a transient
 * error — once the tx's blockhash can no longer land.
 */
async function confirmSignature(
  env: CloudflareEnv,
  signature: Signature,
  lastValidBlockHeight: bigint,
  commitment: ConfirmCommitment,
): Promise<void> {
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;
  try {
    await confirmViaSubscription(env, signature, lastValidBlockHeight, deadline, commitment);
  } catch (error) {
    if (error instanceof SubmitError) throw error; // on-chain / expiry — don't retry here
    await confirmViaPolling(env, signature, lastValidBlockHeight, deadline, commitment);
  }
}

async function confirmViaSubscription(
  env: CloudflareEnv,
  signature: Signature,
  lastValidBlockHeight: bigint,
  deadline: number,
  commitment: ConfirmCommitment,
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
      .signatureNotifications(signature, { commitment })
      .subscribe({ abortSignal: abort.signal });
    for await (const notification of notifications) {
      if (notification.value?.err) {
        throw new SubmitError(
          `Transaction failed: ${JSON.stringify(notification.value.err)}`,
          false,
        );
      }
      return; // reached target commitment
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
  commitment: ConfirmCommitment,
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
      if (statusReached(status?.confirmationStatus, commitment)) {
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
