import type { Instruction } from "phygital-verifier-sdk";

/** Canonical RPC contract for `VerifierSignerEntrypoint` (api + api-signer). */

export type SignTransactionsResult =
  | { ok: true; signatures: string[] }
  | {
      ok: false;
      status: number;
      body: {
        error: string;
        code: string;
        soft: boolean;
        details?: Record<string, unknown>;
      };
    };

export type PreviewAuthorizeInput = {
  phygitalToken: string;
  instructions: readonly Instruction[];
};

export type PreviewAuthorizeResult =
  | { ok: true; intentHash: string }
  | {
      ok: false;
      code: string;
      error: string;
      soft: boolean;
      intentHash?: string;
      details?: Record<string, unknown>;
      /** When set (e.g. coded throws), API uses this HTTP status; else 200. */
      httpStatus?: number;
    };

export type VerifierSignerService = {
  signTransactions(transactions: string[]): Promise<SignTransactionsResult>;
  previewAuthorize(
    input: PreviewAuthorizeInput,
  ): Promise<PreviewAuthorizeResult>;
};
