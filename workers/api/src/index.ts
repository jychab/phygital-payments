/**
 * Phygital Payments API Worker entry.
 * See README.md for folder map, auth layers, and the two traps below:
 * - Two sessions: wallet JWT cookie (`wallet/`) vs LazorKit agent grant (`agent/`).
 * - Two challenges: `/api/challenge` (signer NFC) vs `/api/wallet/auth/challenge` (WebAuthn).
 */
import * as challengeRoute from "@/routes/challenge/route";
import * as modifyAndSignRoute from "@/routes/modifyAndSign/route";
import * as collectibleRoute from "@/routes/tokens/collectible/route";
import * as phygitalRoute from "@/routes/tokens/phygital/route";
import * as verifyTapRoute from "@/routes/verify-tap/route";
import * as walletAccessoriesRoute from "@/routes/wallet/accessories/route";
import * as walletActivityRoute from "@/routes/wallet/activity/route";
import * as walletAssetsRoute from "@/routes/wallet/assets/route";
import * as walletAuthChallengeRoute from "@/routes/wallet/auth/challenge/route";
import * as walletDashboardRoute from "@/routes/wallet/dashboard/route";
import * as walletFeePayerRoute from "@/routes/wallet/fee-payer/route";
import * as walletGrantRoute from "@/routes/wallet/grant/route";
import * as walletPasskeyRoute from "@/routes/wallet/passkey/route";
import * as walletSessionRoute from "@/routes/wallet/session/route";
import * as walletSponsorRoute from "@/routes/wallet/sponsor/route";
import { apiJson } from "@/platform/api-response";
import { runScheduledTasks } from "@/platform/scheduled-tasks";
import { runWithRequestContext } from "@/platform/request-context";

type RouteModule = {
  GET?: (request: Request) => Promise<Response> | Response;
  POST?: (request: Request) => Promise<Response> | Response;
  DELETE?: (request: Request) => Promise<Response> | Response;
  OPTIONS?: (request: Request) => Promise<Response> | Response;
};

const routes = new Map<string, RouteModule>([
  ["/api/challenge", challengeRoute],
  ["/api/modifyAndSign", modifyAndSignRoute],
  ["/api/tokens/collectible", collectibleRoute],
  ["/api/tokens/phygital", phygitalRoute],
  ["/api/verify-tap", verifyTapRoute],
  ["/api/wallet/accessories", walletAccessoriesRoute],
  ["/api/wallet/activity", walletActivityRoute],
  ["/api/wallet/assets", walletAssetsRoute],
  ["/api/wallet/auth/challenge", walletAuthChallengeRoute],
  ["/api/wallet/dashboard", walletDashboardRoute],
  ["/api/wallet/fee-payer", walletFeePayerRoute],
  ["/api/wallet/grant", walletGrantRoute],
  ["/api/wallet/passkey", walletPasskeyRoute],
  ["/api/wallet/session", walletSessionRoute],
  ["/api/wallet/sponsor", walletSponsorRoute],
]);

function allowedOrigins(env: CloudflareEnv): string[] {
  return (env.APP_ORIGIN ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function appCorsOrigin(request: Request, env: CloudflareEnv): string | null {
  const origin = request.headers.get("origin")?.trim();
  if (!origin) return null;
  return allowedOrigins(env).includes(origin) ? origin : null;
}

function allowedMethods(module: RouteModule): string {
  const methods = ["OPTIONS"];
  if (module.GET) methods.unshift("GET");
  if (module.POST) methods.unshift("POST");
  if (module.DELETE) methods.unshift("DELETE");
  return methods.join(", ");
}

function withAppCors(
  request: Request,
  env: CloudflareEnv,
  response: Response,
  methods?: string,
): Response {
  // Public routes may already set `Access-Control-Allow-Origin: *` via corsJson.
  // Do not overwrite that with credentialed APP_ORIGIN headers.
  if (response.headers.has("Access-Control-Allow-Origin")) {
    return response;
  }

  const origin = appCorsOrigin(request, env);
  if (!origin) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Idempotency-Key");
  headers.set("Vary", "Origin");
  if (methods) {
    headers.set("Access-Control-Allow-Methods", methods);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function routeHandler(module: RouteModule, method: string) {
  if (method === "GET") return module.GET;
  if (method === "POST") return module.POST;
  if (method === "DELETE") return module.DELETE;
  if (method === "OPTIONS") return module.OPTIONS;
  return undefined;
}

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    const pathname = new URL(request.url).pathname.replace(/\/+$/, "") || "/";
    const route = routes.get(pathname);
    if (!route) {
      if (pathname === "/") {
        return apiJson({ service: "phygital-payments-api", version: "v1" });
      }
      return apiJson({ error: "Not found" }, 404);
    }

    const handler = routeHandler(route, request.method);
    if (!handler && request.method === "OPTIONS") {
      return withAppCors(
        request,
        env,
        new Response(null, { status: 204 }),
        allowedMethods(route),
      );
    }
    if (!handler) {
      return apiJson({ error: "Method not allowed" }, 405);
    }

    const response = await runWithRequestContext({ env, request, ctx }, () =>
      handler(request),
    );
    return withAppCors(request, env, response, allowedMethods(route));
  },

  async scheduled(
    _event: ScheduledEvent,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ) {
    const request = new Request("https://internal.cron/api/cron");
    await runWithRequestContext({ env, request, ctx }, () => runScheduledTasks(env));
  },
};
