// Dev-only worker entry for `next dev`.
//
// `initOpenNextCloudflareForDev` boots wrangler's getPlatformProxy so KV
// bindings (revibase_counter) work locally. The production
// entry (`custom-worker.ts`) can't be used for this because it imports the
// built `.open-next/worker.js`, which does not exist during `next dev`.
//
// The fetch handler is never invoked in dev (Next serves requests); it only
// exists to satisfy the worker module shape.
export default {
  fetch(): Response {
    return new Response("dev worker (bindings proxy only)", { status: 404 });
  },
};
