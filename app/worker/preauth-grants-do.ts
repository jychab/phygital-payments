import { DurableObject } from "cloudflare:workers";

import { REVOKED_API_KEY } from "./api-key-hmac";
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
  expiresAt: number;
  consumedAt: number | null;
  claimedAt: number | null;
  claimedBy: string | null;
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

  async currentGeneration(): Promise<number> {
    return (await this.ctx.storage.get<number>(GENERATION_KEY)) ?? 0;
  }

  async open(args: { gen: number }): Promise<PreauthGrant> {
    const now = Math.floor(Date.now() / 1000);

    const generation =
      (await this.ctx.storage.get<number>(GENERATION_KEY)) ?? 0;
    if (args.gen < generation) {
      throw new Error(REVOKED_API_KEY);
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
      expiresAt,
      consumedAt: null,
      claimedAt: null,
      claimedBy: null,
    };

    await this.ctx.storage.put({
      [GRANT_KEY]: grant,
      [LAST_OPEN_AT_KEY]: now,
    });
    await this.ctx.storage.setAlarm(expiresAt * 1000);

    return { id: grant.id, expiresAt: grant.expiresAt };
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
   * Mint and amount are enforced on-chain (delegate + balance), not here.
   */
  async claim(args: { jobId: string }): Promise<{ grantId: string }> {
    const now = Math.floor(Date.now() / 1000);
    const grant = await this.loadActiveGrant(now);
    if (!grant) {
      throw new Error("No active preauth grant for this wallet");
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
}
