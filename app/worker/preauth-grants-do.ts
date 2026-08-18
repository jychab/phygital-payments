import { DurableObject } from "cloudflare:workers";

import {
  PREAUTH_MIN_INTERVAL_SECONDS,
  PREAUTH_TTL_SECONDS,
  type PreauthGrant,
} from "./preauth-grant-types";

const GRANT_KEY = "grant";
const LAST_OPEN_AT_KEY = "lastOpenAt";
const GENERATION_KEY = "generation";

type StoredGrant = {
  id: string;
  maxAmount: string;
  mint: string | null;
  expiresAt: number;
  consumedAt: number | null;
  claimedAt: number | null;
  claimedBy: string | null;
  createdAt: number;
};

/** One DO instance per payer wallet — holds the latest single-use spending window. */
export class PreauthGrantsDO extends DurableObject<CloudflareEnv> {
  /** Bump key generation and return the new value. Called by `/provision`. */
  async rotate(): Promise<{ gen: number }> {
    const current =
      (await this.ctx.storage.get<number>(GENERATION_KEY)) ?? 0;
    const next = current + 1;
    await this.ctx.storage.put(GENERATION_KEY, next);
    return { gen: next };
  }

  async open(args: {
    wallet: string;
    gen: number;
    maxAmount: string;
    mint: string | null;
  }): Promise<PreauthGrant> {
    const now = Math.floor(Date.now() / 1000);

    const generation =
      (await this.ctx.storage.get<number>(GENERATION_KEY)) ?? 0;
    if (args.gen < generation) {
      throw new Error("Key has been revoked — re-provision to get a new key");
    }

    const lastOpen = await this.ctx.storage.get<number>(LAST_OPEN_AT_KEY);
    if (
      lastOpen != null &&
      now - lastOpen < PREAUTH_MIN_INTERVAL_SECONDS
    ) {
      throw new Error("Preauth rate limited — try again in a moment");
    }

    const id = crypto.randomUUID();
    const expiresAt = now + PREAUTH_TTL_SECONDS;
    const grant: StoredGrant = {
      id,
      maxAmount: args.maxAmount,
      mint: args.mint,
      expiresAt,
      consumedAt: null,
      claimedAt: null,
      claimedBy: null,
      createdAt: now,
    };

    await this.ctx.storage.put({
      [GRANT_KEY]: grant,
      [LAST_OPEN_AT_KEY]: now,
    });
    await this.ctx.storage.setAlarm(expiresAt * 1000);

    return this.toPreauthGrant(args.wallet, grant);
  }

  /** Cancel any open spending window (Pay panel Cancel / reopen). */
  async cancel(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const grant = await this.loadActiveGrant(now);
    if (!grant) return;
    grant.consumedAt = now;
    await this.ctx.storage.put(GRANT_KEY, grant);
    await this.ctx.storage.deleteAlarm();
  }

  /**
   * Atomically claim the active grant for a transfer job (single-use in-flight).
   * Mint must match when bound; amount must be ≤ maxAmount.
   */
  async claim(args: {
    wallet: string;
    amount: string;
    mint: string;
    jobId: string;
  }): Promise<{ grantId: string }> {
    const now = Math.floor(Date.now() / 1000);
    const grant = await this.loadActiveGrant(now);
    if (!grant) {
      throw new Error("No active preauth grant for this wallet");
    }
    if (grant.mint && grant.mint !== args.mint) {
      throw new Error("Preauth grant mint mismatch");
    }
    if (BigInt(args.amount) > BigInt(grant.maxAmount)) {
      throw new Error("Transfer amount exceeds preauth maxAmount");
    }
    if (grant.claimedAt != null) {
      throw new Error("Preauth grant already used");
    }

    grant.claimedAt = now;
    grant.claimedBy = args.jobId;
    await this.ctx.storage.put(GRANT_KEY, grant);
    return { grantId: grant.id };
  }

  /** Finalize single-use after a successful submit. */
  async consume(args: { grantId: string }): Promise<void> {
    const grant = await this.ctx.storage.get<StoredGrant>(GRANT_KEY);
    if (!grant || grant.id !== args.grantId || grant.consumedAt != null) return;
    grant.consumedAt = Math.floor(Date.now() / 1000);
    await this.ctx.storage.put(GRANT_KEY, grant);
    await this.ctx.storage.deleteAlarm();
  }

  /** Release an in-flight claim so a retry can re-claim. */
  async releaseClaim(args: { grantId: string }): Promise<void> {
    const grant = await this.ctx.storage.get<StoredGrant>(GRANT_KEY);
    if (!grant || grant.id !== args.grantId || grant.consumedAt != null) return;
    grant.claimedAt = null;
    grant.claimedBy = null;
    await this.ctx.storage.put(GRANT_KEY, grant);
  }

  async alarm(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const grant = await this.ctx.storage.get<StoredGrant>(GRANT_KEY);
    if (!grant || grant.consumedAt != null) return;
    if (grant.expiresAt <= now) {
      grant.consumedAt = now;
      await this.ctx.storage.put(GRANT_KEY, grant);
    }
  }

  private async loadActiveGrant(now: number): Promise<StoredGrant | null> {
    const grant = await this.ctx.storage.get<StoredGrant>(GRANT_KEY);
    if (!grant || grant.consumedAt != null || grant.expiresAt <= now) {
      return null;
    }
    return grant;
  }

  private toPreauthGrant(wallet: string, grant: StoredGrant): PreauthGrant {
    return {
      id: grant.id,
      wallet,
      maxAmount: grant.maxAmount,
      mint: grant.mint,
      expiresAt: grant.expiresAt,
      consumedAt: grant.consumedAt,
    };
  }
}
