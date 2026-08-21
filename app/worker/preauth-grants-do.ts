import { DurableObject } from "cloudflare:workers";

import { REVOKED_API_KEY } from "./api-key-hmac";
import {
  PREAUTH_MIN_INTERVAL_SECONDS,
  PREAUTH_TTL_SECONDS,
  type GrantPaymentStamp,
  type PreauthGrant,
} from "./preauth-grant-types";
import { resolveRequirePreauth } from "../shared/preauth-required";
import {
  GRANT_NOT_FOUND,
  closeGrantForReplacement,
  currentActiveGrant,
  expiredPreauthStatus,
  findGrant,
  newStoredGrant,
  prependGrant,
  remainingWaitMs,
  resolvePreauthStatus,
  shouldStampPayment,
  type PreauthStatusResult,
  type StoredGrant,
} from "../shared/preauth-status";

const GRANTS_KEY = "grants";
const GENERATION_KEY = "generation";
const REQUIRED_KEY = "requirePreauth";

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

/** One DO instance per payer wallet — latest spending window plus one predecessor. */
export class PreauthGrantsDO extends DurableObject<CloudflareEnv> {
  private generation: number | undefined;
  private grants: StoredGrant[] | undefined;
  /** `null` = never toggled (migrate from generation). */
  private requirePreauth: boolean | null | undefined;
  /** One controller per grantId — concurrent /status waiters share it. */
  private readonly waiters = new Map<string, AbortController>();

  /** Bump key generation and return the new value. Called by `/provision`. */
  async rotate(): Promise<{ gen: number }> {
    await this.loadState();
    const next = this.generation! + 1;
    this.generation = next;
    await this.ctx.storage.put(GENERATION_KEY, next);
    return { gen: next };
  }

  async currentGeneration(): Promise<number> {
    await this.loadState();
    return this.generation!;
  }

  async getPayState(): Promise<{ required: boolean; generation: number }> {
    await this.loadState();
    return {
      required: resolveRequirePreauth(this.requirePreauth, this.generation!),
      generation: this.generation!,
    };
  }

  /**
   * Persist the Confirm Payments toggle. Turning on with generation 0 also
   * issues the first API-key generation so this phone can press Pay.
   */
  async setRequired(args: { required: boolean }): Promise<{
    required: boolean;
    gen: number;
    issued: boolean;
  }> {
    await this.loadState();
    const issued = args.required && this.generation === 0;
    this.requirePreauth = args.required;
    if (issued) {
      this.generation = 1;
      await this.ctx.storage.put({
        [REQUIRED_KEY]: args.required,
        [GENERATION_KEY]: 1,
      });
    } else {
      await this.ctx.storage.put(REQUIRED_KEY, args.required);
    }
    return {
      required: args.required,
      gen: this.generation!,
      issued,
    };
  }

  async open(args: { gen: number }): Promise<PreauthGrant> {
    await this.loadState();
    this.assertGeneration(args.gen);

    const now = Math.floor(Date.now() / 1000);
    const current = this.grants![0];
    if (
      current != null &&
      now - current.openedAt < PREAUTH_MIN_INTERVAL_SECONDS
    ) {
      throw new Error("Preauth rate limited — try again in a moment");
    }

    if (current && closeGrantForReplacement(current, now)) {
      this.abortWaiters(current.id);
    }

    const grant = newStoredGrant(now, PREAUTH_TTL_SECONDS);
    this.grants = prependGrant(this.grants!, grant);
    await this.persistGrants();

    return { id: grant.id, expiresAt: grant.expiresAt };
  }

  /** Cancel any open spending window (Pay panel Cancel / reopen). */
  async cancel(args: { gen: number }): Promise<void> {
    await this.loadState();
    this.assertGeneration(args.gen);
    const now = Math.floor(Date.now() / 1000);
    const grant = currentActiveGrant(this.grants!, now);
    if (!grant) return;
    grant.closedReason = "cancelled";
    grant.consumedAt = now;
    this.abortWaiters(grant.id);
    await this.persistGrants();
  }

  /**
   * Claim the active grant when Confirm Payments is on. Returns `grantId: null`
   * when the setting is off so settle can skip without a second RPC.
   */
  async claim(args: { jobId: string }): Promise<{ grantId: string | null }> {
    await this.loadState();
    if (!resolveRequirePreauth(this.requirePreauth, this.generation!)) {
      return { grantId: null };
    }
    const now = Math.floor(Date.now() / 1000);
    const grant = currentActiveGrant(this.grants!, now);
    if (!grant) {
      throw new Error("No active preauth grant for this wallet");
    }
    if (grant.claimedAt != null) {
      throw new Error("Preauth grant already used");
    }

    grant.claimedAt = now;
    grant.claimedBy = args.jobId;
    await this.persistGrants();
    return { grantId: grant.id };
  }

  /** Finalize single-use after a successful submit. */
  async consume(args: { grantId: string }): Promise<void> {
    await this.loadState();
    const grant = findGrant(this.grants!, args.grantId);
    if (!grant || grant.consumedAt != null) return;
    grant.consumedAt = Math.floor(Date.now() / 1000);
    await this.persistGrants();
  }

  /** Release an in-flight claim so a retry can re-claim. */
  async releaseClaim(args: { grantId: string }): Promise<void> {
    await this.loadState();
    const grant = findGrant(this.grants!, args.grantId);
    if (!grant || grant.consumedAt != null) return;
    grant.claimedAt = null;
    grant.claimedBy = null;
    await this.persistGrants();
  }

  /**
   * Block until this grant is cancelled, replaced, expired, or webhook-stamped.
   * Uses scheduler.wait so cancel / open / recordPayment can run concurrently.
   */
  async status(args: {
    grantId: string;
    gen: number;
  }): Promise<PreauthStatusResult> {
    await this.loadState();
    this.assertGeneration(args.gen);

    const grant = findGrant(this.grants!, args.grantId);
    if (!grant) throw new Error(GRANT_NOT_FOUND);

    for (;;) {
      const resolved = resolvePreauthStatus(grant);
      if (resolved !== "pending") return resolved;

      const waitMs = remainingWaitMs(grant, Date.now());
      if (waitMs <= 0) {
        return expiredPreauthStatus(grant.id);
      }

      let controller = this.waiters.get(args.grantId);
      if (!controller || controller.signal.aborted) {
        controller = new AbortController();
        this.waiters.set(args.grantId, controller);
      }

      try {
        await scheduler.wait(waitMs, { signal: controller.signal });
      } catch (error) {
        if (!isAbortError(error)) throw error;
      }
    }
  }

  /** Stamp the current window from a Helius TransferEvent. No-op if no match. */
  async recordPayment(args: GrantPaymentStamp): Promise<void> {
    await this.loadState();
    const current = this.grants![0];
    if (!shouldStampPayment(current, args.blockTime)) return;
    if (!args.recipient) return;

    current.payment = {
      recipient: args.recipient,
      amount: args.amount,
      mint: args.mint,
      signature: args.signature,
    };
    this.abortWaiters(current.id);
    await this.persistGrants();
  }

  private assertGeneration(gen: number): void {
    if (gen < this.generation!) {
      throw new Error(REVOKED_API_KEY);
    }
  }

  private abortWaiters(grantId: string): void {
    const controller = this.waiters.get(grantId);
    if (!controller || controller.signal.aborted) return;
    controller.abort();
    this.waiters.delete(grantId);
  }

  private async loadState(): Promise<void> {
    if (
      this.grants != null &&
      this.generation != null &&
      this.requirePreauth !== undefined
    ) {
      return;
    }

    const stored = await this.ctx.storage.get([
      GENERATION_KEY,
      GRANTS_KEY,
      REQUIRED_KEY,
    ]);
    this.generation = (stored.get(GENERATION_KEY) as number | undefined) ?? 0;
    this.grants = (stored.get(GRANTS_KEY) as StoredGrant[] | undefined) ?? [];
    const required = stored.get(REQUIRED_KEY);
    this.requirePreauth = typeof required === "boolean" ? required : null;
  }

  private async persistGrants(): Promise<void> {
    await this.ctx.storage.put({
      [GENERATION_KEY]: this.generation,
      [GRANTS_KEY]: this.grants,
    });
  }
}
