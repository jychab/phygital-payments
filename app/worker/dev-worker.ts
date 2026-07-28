// Dev-only worker entry for `next dev`.
//
// `initOpenNextCloudflareForDev` boots wrangler's getPlatformProxy against
// `wrangler.dev.jsonc`, which points `main` here. getPlatformProxy needs to
// load a module that *exports the Durable Object class* to make the
// TRANSFER_SUBMITTER binding usable locally. The production entry
// (`custom-worker.ts`) can't be used for this because it imports the built
// `.open-next/worker.js`, which does not exist during `next dev`.
//
// The fetch handler is never invoked in dev (Next serves requests); it only
// exists to satisfy the worker module shape.
export { TransferSubmitterDO } from "./transfer-submitter";

export default {
  fetch(): Response {
    return new Response("dev worker (bindings proxy only)", { status: 404 });
  },
};
