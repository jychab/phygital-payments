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

export function getRpc(env: CloudflareEnv) {
  return createSolanaRpc(env.NEXT_PUBLIC_SOLANA_RPC_URL);
}

function subscriptionsUrl(env: CloudflareEnv): string {
  return (
    env.NEXT_PUBLIC_SOLANA_RPC_URL.replace(/^http/, "ws")
  );
}

export function getRpcSubscriptions(env: CloudflareEnv) {
  return createSolanaRpcSubscriptions(subscriptionsUrl(env));
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

/**
 * Simulate → size compute budget → send (skipPreflight, already simulated) →
 * await `confirmed`. Returns the confirmed signature.
 */
export async function sendSponsoredBatch(
  env: CloudflareEnv,
  jobs: TransferJob[],
  ctx: SendContext,
): Promise<string> {
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

  await confirmSignature(env, signature);
  return signature;
}

/**
 * Await `confirmed` via WebSocket signature subscription (premium RPC), with a
 * getSignatureStatuses polling fallback if the subscription can't be opened.
 */
async function confirmSignature(env: CloudflareEnv, signature: Signature): Promise<void> {
  try {
    await confirmViaSubscription(env, signature);
  } catch (error) {
    if (error instanceof SubmitError) throw error; // on-chain failure — don't retry
    await confirmViaPolling(env, signature);
  }
}

async function confirmViaSubscription(
  env: CloudflareEnv,
  signature: Signature,
): Promise<void> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), CONFIRM_TIMEOUT_MS);
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
    throw new Error("Subscription closed before confirmation");
  } finally {
    clearTimeout(timer);
    abort.abort();
  }
}

async function confirmViaPolling(env: CloudflareEnv, signature: Signature): Promise<void> {
  const rpc = getRpc(env);
  const deadline = Date.now() + CONFIRM_TIMEOUT_MS;
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
      if (
        status?.confirmationStatus === "confirmed" ||
        status?.confirmationStatus === "finalized"
      ) {
        return;
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
