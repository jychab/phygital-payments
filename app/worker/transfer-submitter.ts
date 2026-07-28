import { DurableObject } from "cloudflare:workers";

import type { TransactionSigner } from "@solana/kit";

import {
  fetchLatestBlockhash,
  getFeePayerSigner,
  SubmitError,
  sendSponsoredBatch,
  validateTransferWire,
  type BlockhashLifetime,
  type SendContext,
} from "./solana";
import {
  BATCH_ACTIVITY_WINDOW_MS,
  BATCH_WINDOW_MS,
  BLOCKHASH_TTL_MS,
  FORCE_FLUSH_AGE_MS,
  IDLE_FLUSH_MS,
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

export class TransferSubmitterDO extends DurableObject<CloudflareEnv> {
  private flushing = false;

  // In-memory caches (survive while the DO is warm; rebuilt on eviction).
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

    await this.ctx.storage.put(`${JOB_PREFIX}${jobId}`, job);
    const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) ?? [];
    const wasEmpty = queue.length === 0;
    // Coalescing is only worthwhile when a peer arrived recently; otherwise a
    // single terminal pays no batch-window latency.
    const recentlyActive = now - this.lastEnqueueAt <= BATCH_ACTIVITY_WINDOW_MS;
    this.lastEnqueueAt = now;
    queue.push(jobId);
    await this.ctx.storage.put(QUEUE_KEY, queue);

    // Warm the blockhash cache in the background while the flush alarm pends.
    void this.refreshBlockhash().catch(() => {});

    const oldest = wasEmpty ? job : await this.getJob(queue[0]!);
    const oldestAging =
      !!oldest && now - oldest.createdAtMs >= FORCE_FLUSH_AGE_MS;

    if (queue.length >= MAX_BATCH_SIZE || oldestAging) {
      await this.ctx.storage.setAlarm(Date.now()); // flush ASAP
    } else {
      const alarm = await this.ctx.storage.getAlarm();
      if (alarm == null) {
        // Idle → flush almost immediately; busy → allow a coalescing window.
        const delay = recentlyActive ? BATCH_WINDOW_MS : IDLE_FLUSH_MS;
        await this.ctx.storage.setAlarm(Date.now() + delay);
      }
    }

    return { jobId };
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
    const job = await this.getJob(jobId);
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

    return this.getJob(jobId);
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
      const queuedJobs: TransferJob[] = [];
      for (const id of queue) {
        const job = await this.getJob(id);
        if (!job) continue;
        // Drop jobs too stale to land against SlotHashes anymore.
        if (job.status === "queued" && now - job.createdAtMs > MAX_JOB_AGE_MS) {
          await this.finish(job, "failed", {
            error: "Expired before submission (SlotHashes validity)",
          });
          continue;
        }
        if (job.status === "queued") queuedJobs.push(job);
      }
      if (queuedJobs.length > 0) {
        // Group by slot so coalesced transfers share ordering; oldest first.
        queuedJobs.sort((a, b) => {
          const slot = BigInt(a.slotNumber) - BigInt(b.slotNumber);
          if (slot < 0n) return -1;
          if (slot > 0n) return 1;
          return a.createdAtMs - b.createdAtMs;
        });

        const batch = queuedJobs.slice(0, MAX_BATCH_SIZE);
        for (const job of batch) {
          job.status = "submitted";
          job.attempts += 1;
          await this.ctx.storage.put(`${JOB_PREFIX}${job.id}`, job);
        }
        const ctx = await this.getSendContext();
        // submitBatch leaves each job terminal (confirmed/failed) or requeued
        // ("queued"); the backoff alarm for requeues is set inside it.
        await this.submitBatch(batch, ctx);
      }

      // Drop terminal/missing jobs; keep still-queued ones (peers + requeues).
      await this.compactQueue();
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
    try {
      const signature = await sendSponsoredBatch(this.env, batch, ctx);
      for (const job of batch) {
        await this.finish(job, "confirmed", { signature });
      }
    } catch (error) {
      console.log(error)
      const { transient, message } = classify(error);

      if (!transient && batch.length > 1) {
        // Degrade to per-job submits (only this failed batch loses coalescing).
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

  /** Rebuild the queue to only ids whose job still exists and is queued. */
  private async compactQueue(): Promise<void> {
    const queue = (await this.ctx.storage.get<string[]>(QUEUE_KEY)) ?? [];
    const remaining: string[] = [];
    for (const id of queue) {
      const job = await this.getJob(id);
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
