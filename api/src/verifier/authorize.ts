/**
 * Transaction approval hook used by `/preview` and `/sign`.
 *
 * Default wires to Revibase `./approval` (standing policies + one-time grants).
 *
 * To build your own verifier, replace the export below — keep the request/result
 * types so the HTTP routes stay unchanged:
 *
 * ```ts
 * export async function authorizeIntent(req: AuthorizeRequest): Promise<AuthorizeResult> {
 *   // your rules…
 *   return { ok: true, intentHash: "…" };
 * }
 * ```
 */
export type { AuthorizeRequest, AuthorizeResult } from "@/verifier/approval";
export { authorizeIntent } from "@/verifier/approval";
