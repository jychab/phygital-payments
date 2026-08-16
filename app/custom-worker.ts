// Custom Cloudflare Worker entry: serves the OpenNext Next.js app *and* hosts
// the transfer-submitter Durable Object in a single deployed worker.
// The DO class must be exported from the worker's module for the runtime to
// instantiate it (see the `durable_objects` binding in wrangler.jsonc).
//
// `.open-next/worker.js` is produced by `opennextjs-cloudflare build`, so this
// import only resolves after a build (it is excluded from the Next TS project).
// @ts-expect-error — generated at build time; missing during `next`/IDE typecheck
import { default as handler } from "./.open-next/worker.js";

export { TransferSubmitterDO } from "./worker/transfer-submitter";

export default handler;
