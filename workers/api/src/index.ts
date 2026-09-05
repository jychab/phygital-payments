/**
 * Revibase API Worker entry.
 *
 * Code map → `api/README.md`
 * Domains → `tokens/`, `tap/`, `auth/`, `verifier/`, `shared/`
 */
import { Hono } from "hono";

import { deviceAuthRoutes } from "@/auth/device-routes";
import { policyRoutes } from "@/auth/policies-routes";
import { appCors } from "@/shared/cors";
import { runWithRequestStore } from "@/shared/request-context";
import { verifyTapRoutes } from "@/tap/routes";
import { tokenRoutes } from "@/tokens/routes";
import { verifierRoutes } from "@/verifier";
import { heliusWebhookRoutes } from "@/webhooks/helius";
import { walletRoutes } from "@/wallet/routes";

const app = new Hono<{ Bindings: Env }>();

app.use("*", appCors);

app.use("*", async (c, next) => {
  await runWithRequestStore(
    {
      env: c.env,
      waitUntil: (promise) => c.executionCtx.waitUntil(promise),
    },
    () => next(),
  );
});

app.get("/health", (c) => c.json({ ok: true }));

app.route("/", tokenRoutes);
app.route("/", walletRoutes);
app.route("/", verifyTapRoutes);
app.route("/", verifierRoutes);
app.route("/", policyRoutes);
app.route("/", deviceAuthRoutes);
app.route("/", heliusWebhookRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
