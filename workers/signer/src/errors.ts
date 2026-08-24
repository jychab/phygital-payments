import type { SignerRpcErrorBody } from "./protocol";

export const SIGNER_REQUEST_EXPIRED = "This request expired.";

export class SignerError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "SignerError";
    this.status = status;
    this.code = code;
  }

  static fromResponse(status: number, body: SignerRpcErrorBody): SignerError {
    return new SignerError(body.error || "Signer request failed", status, body.code);
  }
}
