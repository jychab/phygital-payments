/**
 * Private verifier signer Worker — service-binding RPC only.
 *
 * Owns: fee gate, authorizeIntent, ed25519 co-sign (pluggable backend).
 * Not publicly routed; callers must be revibase-api via VERIFIER_SIGNER.
 */
import { WorkerEntrypoint } from "cloudflare:workers";

import { mapCodedVerifierError } from "@/verifier/coded-error";
import { runWithRequestStore } from "@/shared/request-context";
import type {
  PreviewAuthorizeInput,
  PreviewAuthorizeResult,
  SignTransactionsResult,
} from "@/verifier/signer-service";

import { createVerifierSignerBackend } from "./backend/create.js";
import type { VerifierSignerBackend } from "./backend/types.js";
import { previewAuthorize } from "./flows/preview-authorize.js";
import { signTransactions } from "./flows/sign-transactions.js";

export class VerifierSignerEntrypoint extends WorkerEntrypoint<Env> {
  #backend: VerifierSignerBackend | null = null;

  #getBackend(): VerifierSignerBackend {
    if (!this.#backend) {
      this.#backend = createVerifierSignerBackend(this.env);
    }
    return this.#backend;
  }

  #withStore<T>(fn: () => T | Promise<T>): Promise<T> {
    return Promise.resolve(
      runWithRequestStore(
        {
          env: this.env,
          waitUntil: (p) => this.ctx.waitUntil(p),
        },
        fn,
      ),
    );
  }

  async signTransactions(
    transactions: string[],
  ): Promise<SignTransactionsResult> {
    return this.#withStore(async () => {
      try {
        return await signTransactions(transactions, this.#getBackend());
      } catch (err) {
        const mapped = mapCodedVerifierError(err);
        return {
          ok: false as const,
          status: mapped.status,
          body: {
            error: mapped.error,
            code: mapped.code,
            soft: mapped.soft,
            details: mapped.details,
          },
        };
      }
    });
  }

  async previewAuthorize(
    input: PreviewAuthorizeInput,
  ): Promise<PreviewAuthorizeResult> {
    return this.#withStore(async () => {
      try {
        return await previewAuthorize(input);
      } catch (err) {
        const mapped = mapCodedVerifierError(err);
        return {
          ok: false as const,
          code: mapped.code,
          error: mapped.error,
          soft: mapped.soft,
          details: mapped.details,
          httpStatus: mapped.status,
        };
      }
    });
  }
}

/** No public HTTP surface — use service binding RPC. */
export default {
  async fetch(): Promise<Response> {
    return new Response("Not found", { status: 404 });
  },
};

export type {
  PreviewAuthorizeInput,
  PreviewAuthorizeResult,
  SignTransactionsResult,
};
