import { json } from "@/shared/http";

/** Map thrown `{ code, soft?, details? }` errors to HTTP responses. */
export function verifierJsonError(err: unknown, kind: "preview" | "sign") {
  const coded =
    err && typeof err === "object" && "code" in err
      ? (err as {
          code: string;
          soft?: boolean;
          details?: Record<string, unknown>;
        })
      : null;

  const code = coded?.code ?? "invalid_transaction";
  const error = err instanceof Error ? err.message : "Request failed";
  const soft = Boolean(coded?.soft);
  const status =
    code === "signer_misconfigured"
      ? 500
      : code === "verifier_mismatch"
        ? 403
        : 400;

  if (kind === "preview") {
    return json({ ok: false, code, error, soft }, { status });
  }
  return json(
    { error, code, soft, details: coded?.details },
    { status },
  );
}
