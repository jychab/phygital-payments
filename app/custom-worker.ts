// Custom Cloudflare Worker entry: serves the OpenNext Next.js app.
// `.open-next/worker.js` is produced by `opennextjs-cloudflare build`, so this
// import only resolves after a build (it is excluded from the Next TS project).
// @ts-expect-error — generated at build time; missing during `next`/IDE typecheck
import { default as handler } from "./.open-next/worker.js";

export default handler;
