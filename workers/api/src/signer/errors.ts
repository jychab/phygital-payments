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

export function signerErrorToHttp(error: unknown): { message: string; status: number } {
  if (error instanceof SignerError) {
    if (error.status === 410) {
      return { message: SIGNER_REQUEST_EXPIRED, status: 410 };
    }
    return { message: error.message, status: error.status >= 400 ? error.status : 500 };
  }
  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }
  return { message: "Signer request failed", status: 500 };
}
