import { DurableObject } from "cloudflare:workers";

import type { TransactionSigner } from "@solana/kit";
import { address } from "@solana/kit";
import { fetchMaybeOwnerVerifier } from "phygital-payments-sdk";

import {
  fetchLatestBlockhash,
  getFeePayerSigner,
  getRpc,
  SubmitError,
  sendSponsoredBatch,
  validateTransferWire,
  type BlockhashLifetime,
  type SendContext,
} from "./solana";
import type { GrantClaim } from "./preauth-grant-types";
import type { PreauthGrantsDO } from "./preauth-grants-do";
import {
  BATCH_ACTIVITY_WINDOW_MS,
  BATCH_WINDOW_MS,
  BLOCKHASH_TTL_MS,
  FORCE_FLUSH_AGE_MS,
  JOB_WAIT_TIMEOUT_MS,
  MAX_BATCH_SIZE,
  MAX_JOB_AGE_MS,
  MAX_SUBMIT_ATTEMPTS,
  RETRY_BACKOFF_MS,
  type JobStatus,
  type SubmitTransferRequest,
  type TransferJob,
} from "./types";

const QUEUE_KEY = "queue";
const JOB_PREFIX = "job:";
const IDEMPOTENCY_PREFIX = "idem:";

export class TransferSubmitterDO extends DurableObject<CloudflareEnv> {
  private flushing = false;

  // In-memory caches (rebuilt on DO eviction).
  private feePayerSigner?: TransactionSigner;
  private blockhashCache?: { value: BlockhashLifetime; fetchedAt: number };
  private lastEnqueueAt = 0;
  // Long-poll waiters resolved the instant a job reaches a terminal status.
  private waiters = new Map<string, Array<() => void>>();

  async enqueue(body: SubmitTransferRequest): Promise<{ jobId: string }> {
    validateTransferWire(body.transfer);

    const now = Date.now();
    const createdAtMs = body.createdAtMs ?? now;
    if (now - createdAtMs > MAX_JOB_AGE_MS) {
      throw new Error("Transfer job is too stale for SlotHashes validity");
    }

    // Network-blip safe: same WebAuthn assertion → same job (no second grant claim).
    const idem = body.idempotencyKey?.trim();
    if (idem) {
      const existingId = await this.ctx.storage.get<string>(
        `${IDEMPOTENCY_PREFIX}${idem}`,
      );
      if (existingId) {
        const existing = await this.getJob(existingId);
        if (existing) {
          // Resume: if the first request died mid-flush, kick another pass.
          if (existing.status === "queued") {
            await this.flush();
          }
          return { jobId: existingId };
        }
      }
    }

    const jobId = crypto.randomUUID();
    const job: TransferJob = {
      id: jobId,
      createdAtMs,
      slotNumber: body.transfer.slotNumber,
      secpEntry: body.secpEntry,
      transfer: body.transfer,
      status: "queued",
      attempts: 0,
    };

    const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) ?? [];
    const wasEmpty = queue.length === 0;
    // Coalescing is only worthwhile when a peer arrived recently; otherwise a
    // single terminal pays no batch-window latency.
    const recentlyActive = now - this.lastEnqueueAt <= BATCH_ACTIVITY_WINDOW_MS;
    this.lastEnqueueAt = now;
    queue.push(jobId);

    const puts: Record<string, unknown> = {
      [`${JOB_PREFIX}${jobId}`]: job,
      [QUEUE_KEY]: queue,
    };
    if (idem) {
      puts[`${IDEMPOTENCY_PREFIX}${idem}`] = jobId;
    }
    await this.ctx.storage.put(puts);

    const oldest = wasEmpty ? job : await this.getJob(queue[0]!);
    const oldestAging =
      !!oldest && now - oldest.createdAtMs >= FORCE_FLUSH_AGE_MS;

    if (queue.length >= MAX_BATCH_SIZE || oldestAging) {
      // Full / aging — flush now (inline) so waiting clients aren't gated on
      // Durable Object alarm scheduling jitter.
      await this.flush();
    } else if (!recentlyActive) {
      // Single terminal, idle queue — flush inline for card-like latency.
      await this.flush();
    } else {
      const alarm = await this.ctx.storage.getAlarm();
      if (alarm == null) {
        // Peers arriving — coalesce briefly.
        await this.ctx.storage.setAlarm(Date.now() + BATCH_WINDOW_MS);
      }
    }

    return { jobId };
  }

  /**
   * Enqueue and long-poll until the job is terminal. Collapses submit+wait into
   * one DO interaction from the API route's perspective (one browser RTT).
   */
  async enqueueAndWait(
    body: SubmitTransferRequest,
    timeoutMs: number = JOB_WAIT_TIMEOUT_MS,
  ): Promise<TransferJob> {
    const { jobId } = await this.enqueue(body);
    const job = await this.waitForJob(jobId, timeoutMs);
    if (!job) {
      throw new Error("Transfer job disappeared before completion");
    }
    if (!isTerminal(job.status)) {
      // Hold timed out — return current state; client may retry wait.
      return job;
    }
    return job;
  }

  async getJob(jobId: string): Promise<TransferJob | null> {
    return (
      (await this.ctx.storage.get<TransferJob>(`${JOB_PREFIX}${jobId}`)) ?? null
    );
  }

  /** Long-poll: resolve when the job reaches a terminal status or on timeout. */
  async waitForJob(
    jobId: string,
    timeoutMs: number = JOB_WAIT_TIMEOUT_MS,
  ): Promise<TransferJob | null> {
    return this.waitUntilTerminal(jobId, (id) => this.getJob(id), timeoutMs);
  }

  private async waitUntilTerminal<T extends { status: JobStatus }>(
    jobId: string,
    getJob: (id: string) => Promise<T | null>,
    timeoutMs: number,
  ): Promise<T | null> {
    const job = await getJob(jobId);
    if (!job || isTerminal(job.status)) return job;

    await new Promise<void>((resolve) => {
      const arr = this.waiters.get(jobId) ?? [];
      const timer = setTimeout(() => {
        this.removeWaiter(jobId, entry);
        resolve();
      }, timeoutMs);
      const entry = () => {
        clearTimeout(timer);
        resolve();
      };
      arr.push(entry);
      this.waiters.set(jobId, arr);
    });

    return getJob(jobId);
  }

  async alarm(): Promise<void> {
    await this.flush();
  }

  async flush(): Promise<void> {
    if (this.flushing) return;
    this.flushing = true;
    try {
      await this.ctx.storage.deleteAlarm();
      const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) ?? [];
      if (queue.length === 0) return;

      const now = Date.now();
      const jobKeys = queue.map((id) => `${JOB_PREFIX}${id}`);
      const jobMap = await this.ctx.storage.get<TransferJob>(jobKeys);

      const queuedJobs: TransferJob[] = [];
      const expiredPuts: Record<string, TransferJob> = {};
      for (const id of queue) {
        const job = jobMap.get(`${JOB_PREFIX}${id}`);
        if (!job) continue;
        // Drop jobs too stale to land against SlotHashes anymore.
        if (job.status === "queued" && now - job.createdAtMs > MAX_JOB_AGE_MS) {
          job.status = "failed";
          job.error = "Expired before submission (SlotHashes validity)";
          expiredPuts[`${JOB_PREFIX}${job.id}`] = job;
          this.notify(job.id);
          continue;
        }
        if (job.status === "queued") queuedJobs.push(job);
      }
      if (Object.keys(expiredPuts).length > 0) {
        await this.ctx.storage.put(expiredPuts);
      }

      if (queuedJobs.length > 0) {
        // Group by slot so coalesced transfers share ordering; oldest first.
        queuedJobs.sort((a, b) => {
          const slot = BigInt(a.slotNumber) - BigInt(b.slotNumber);
          if (slot < 0n) return -1;
          if (slot > 0n) return 1;
          return a.createdAtMs - b.createdAtMs;
        });

        const ctx = await this.getSendContext();
        const feePayer = ctx.signer.address;
        // One RPC per distinct OwnerVerifier PDA for this flush.
        const verifierCache = new Map<string, string>();

        const eligible: TransferJob[] = [];
        for (const job of queuedJobs) {
          try {
            const verifier = await this.resolveVerifier(
              job,
              feePayer,
              verifierCache,
            );
            if (verifier !== feePayer) {
              await this.finish(job, "failed", {
                error:
                  "Owner configured an external verifier; submit via their endpoint",
              });
              continue;
            }
            eligible.push(job);
          } catch (error) {
            await this.finish(job, "failed", {
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to resolve verifier",
            });
          }
        }

        if (eligible.length > 0) {
          // Eligible is already Revi-only; take the next MAX_BATCH_SIZE by slot order.
          const batch = eligible.slice(0, MAX_BATCH_SIZE);

          const submittedPuts: Record<string, TransferJob> = {};
          for (const job of batch) {
            job.status = "submitted";
            job.attempts += 1;
            submittedPuts[`${JOB_PREFIX}${job.id}`] = job;
          }
          await this.ctx.storage.put(submittedPuts);
          await this.submitBatch(batch, ctx);
        }
      }

      // Drop terminal/missing jobs; keep still-queued ones (peers + requeues).
      // Reuse the job map we already loaded, then refresh any that may have
      // changed during submit.
      await this.compactQueue(queue);
      const remaining = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) ?? [];
      if (remaining.length > 0 && (await this.ctx.storage.getAlarm()) == null) {
        await this.ctx.storage.setAlarm(Date.now() + BATCH_WINDOW_MS);
      }
    } finally {
      this.flushing = false;
    }
  }

  /**
   * Submit a batch. On a permanent (simulation) failure with more than one job,
   * isolate the bad apple by resubmitting each job on its own so one invalid
   * payment can't fail the whole batch. Transient failures are requeued.
   */
  private async submitBatch(
    batch: TransferJob[],
    ctx: SendContext,
  ): Promise<void> {
    let grantClaims: GrantClaim[] = [];
    try {
      grantClaims = await this.authorizeBatch(batch);
      const signature = await sendSponsoredBatch(this.env, batch, ctx);
      for (const job of batch) {
        await this.finish(job, "confirmed", { signature });
      }
      void this.consumeGrants(grantClaims).catch((error) => {
        console.error("Failed to consume preauth grants", error);
      });
    } catch (error) {
      console.error(
        "Sponsored submit failed",
        error instanceof Error ? error.message : error,
      );
      // Free claims so isolate/retry can re-claim (or the payer can open a new window).
      await this.releaseGrants(grantClaims);
      const { transient, message } = classify(error);

      if (!transient && batch.length > 1) {
        for (const job of batch) {
          await this.submitBatch([job], ctx);
        }
        return;
      }

      const retryAt = Date.now();
      for (const job of batch) {
        const canRetry =
          transient &&
          job.attempts < MAX_SUBMIT_ATTEMPTS &&
          retryAt - job.createdAtMs < MAX_JOB_AGE_MS;
        if (canRetry) {
          job.status = "queued";
          job.error = message;
          await this.ctx.storage.put(`${JOB_PREFIX}${job.id}`, job);
        } else {
          await this.finish(job, "failed", { error: message });
        }
      }

      if (batch.some((j) => j.status === "queued")) {
        const maxAttempts = Math.max(...batch.map((j) => j.attempts));
        await this.ctx.storage.setAlarm(
          Date.now() + RETRY_BACKOFF_MS * Math.max(1, maxAttempts),
        );
      }
    }
  }

  /**
   * Fail closed: each job atomically claims a single-use preauth grant for
   * `asset.owner` (mint match + amount ≤ maxAmount). Same-batch / concurrent
   * peers lose the claim race. Verifier gating happens in {@link flush}
   * (external → fail; only Revi-eligible jobs reach this method).
   */
  private async authorizeBatch(batch: TransferJob[]): Promise<GrantClaim[]> {
    const claims: GrantClaim[] = [];
    try {
      for (const job of batch) {
        const stub = this.preauthGrantsStub(job.transfer.owner);
        const { grantId } = await stub.claim({
          wallet: job.transfer.owner,
          amount: job.transfer.amount,
          mint: job.transfer.mint,
          jobId: job.id,
        });
        claims.push({ grantId, wallet: job.transfer.owner });
      }
      return claims;
    } catch (error) {
      await this.releaseGrants(claims);
      throw new SubmitError(
        error instanceof Error ? error.message : "Preauth grant check failed",
        false,
      );
    }
  }

  private async consumeGrants(claims: GrantClaim[]): Promise<void> {
    await Promise.all(
      claims.map((claim) =>
        this.preauthGrantsStub(claim.wallet).consume({ grantId: claim.grantId }),
      ),
    );
  }

  private async releaseGrants(claims: GrantClaim[]): Promise<void> {
    if (claims.length === 0) return;
    try {
      await Promise.all(
        claims.map((claim) =>
          this.preauthGrantsStub(claim.wallet).releaseClaim({
            grantId: claim.grantId,
          }),
        ),
      );
    } catch (error) {
      console.error("Failed to release preauth claims", error);
    }
  }

  private preauthGrantsStub(wallet: string) {
    const ns = this.env.PREAUTH_GRANTS;
    if (!ns) {
      throw new SubmitError(
        "PREAUTH_GRANTS Durable Object binding is not configured",
        false,
      );
    }
    return ns.get(ns.idFromName(wallet)) as DurableObjectStub<PreauthGrantsDO>;
  }

  /**
   * Resolve the transfer verifier from on-chain OwnerVerifier state.
   */
  private async resolveVerifier(
    job: TransferJob,
    feePayer: string,
    cache?: Map<string, string>,
  ): Promise<string> {
    const key = job.transfer.ownerVerifier;
    const hit = cache?.get(key);
    if (hit !== undefined) return hit;

    const maybe = await fetchMaybeOwnerVerifier(
      getRpc(this.env),
      address(key),
    );
    const verifier = maybe.exists ? maybe.data.verifier : feePayer;
    cache?.set(key, verifier);
    return verifier;
  }

  /** Persist a terminal status and wake any long-poll waiters. */
  private async finish(
    job: TransferJob,
    status: JobStatus,
    patch: { signature?: string; error?: string },
  ): Promise<void> {
    job.status = status;
    if (patch.signature) job.signature = patch.signature;
    if (patch.error) job.error = patch.error;
    await this.ctx.storage.put(`${JOB_PREFIX}${job.id}`, job);
    if (isTerminal(status)) this.notify(job.id);
  }

  // --- cached inputs --------------------------------------------------------

  private async getSendContext(): Promise<SendContext> {
    if (!this.feePayerSigner) {
      this.feePayerSigner = await getFeePayerSigner(this.env);
    }
    const latestBlockhash = await this.refreshBlockhash();
    return { signer: this.feePayerSigner, latestBlockhash };
  }

  private async refreshBlockhash(): Promise<BlockhashLifetime> {
    const now = Date.now();
    if (
      this.blockhashCache &&
      now - this.blockhashCache.fetchedAt < BLOCKHASH_TTL_MS
    ) {
      return this.blockhashCache.value;
    }
    const value = await fetchLatestBlockhash(this.env);
    this.blockhashCache = { value, fetchedAt: now };
    return value;
  }

  // --- long-poll bookkeeping ------------------------------------------------

  private notify(jobId: string): void {
    const arr = this.waiters.get(jobId);
    if (!arr) return;
    this.waiters.delete(jobId);
    for (const resolve of arr) resolve();
  }

  private removeWaiter(jobId: string, entry: () => void): void {
    const arr = this.waiters.get(jobId);
    if (!arr) return;
    const next = arr.filter((e) => e !== entry);
    if (next.length > 0) this.waiters.set(jobId, next);
    else this.waiters.delete(jobId);
  }

  // --- queue maintenance ----------------------------------------------------

  /**
   * Rebuild the queue to only ids whose job still exists and is queued.
   * Uses a single batched storage get for the queue ids.
   */
  private async compactQueue(queueIds?: string[]): Promise<void> {
    const queue =
      queueIds ?? (await this.ctx.storage.get<string[]>(QUEUE_KEY)) ?? [];
    if (queue.length === 0) return;

    const keys = queue.map((id) => `${JOB_PREFIX}${id}`);
    const jobs = await this.ctx.storage.get<TransferJob>(keys);

    const remaining: string[] = [];
    for (const id of queue) {
      const job = jobs.get(`${JOB_PREFIX}${id}`);
      if (job && job.status === "queued") remaining.push(id);
    }
    if (remaining.length !== queue.length) {
      await this.ctx.storage.put(QUEUE_KEY, remaining);
    }
  }
}

function isTerminal(status: JobStatus): boolean {
  return status === "confirmed" || status === "failed";
}

function classify(error: unknown): { transient: boolean; message: string } {
  if (error instanceof SubmitError) {
    return { transient: error.transient, message: error.message };
  }
  return {
    transient: true,
    message: error instanceof Error ? error.message : "Sponsored submit failed",
  };
}
