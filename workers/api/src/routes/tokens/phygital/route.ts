import { withApiMetrics } from "@/platform/analytics";
import {
  getMaybePhygitalTokenByPasskey,
  getPhygitalTokenByIdentifier,
} from "@/phygital/lookup";
import { toPhygitalTokenWire } from "@/phygital/token-wire";
import { apiJson } from "@/platform/api-response";
import { rateLimitOrResponse, rateLimitPresets } from "@/platform/rate-limit";
import { toUserErrorMessage } from "@/platform/user-errors";

export async function GET(req: Request) {
  return withApiMetrics("/api/tokens/phygital", async () => {
    const limited = await rateLimitOrResponse(req, rateLimitPresets.publicRead);
    if (limited) return limited;

    const url = new URL(req.url);
    const identifier = url.searchParams.get("identifier");
    const passkey = url.searchParams.get("passkey");

    if (!identifier && !passkey) {
      return apiJson({ error: "Missing identifier or passkey" }, 400);
    }
    if (identifier && passkey) {
      return apiJson({ error: "Pass one of identifier or passkey" }, 400);
    }

    try {
      if (identifier) {
        const token = await getPhygitalTokenByIdentifier(identifier);
        return apiJson({ token: toPhygitalTokenWire(token) });
      }
      const token = await getMaybePhygitalTokenByPasskey(passkey!);
      return apiJson({ token: token ? toPhygitalTokenWire(token) : null });
    } catch (error) {
      const message = toUserErrorMessage(error, "Couldn’t load this accessory");
      if (/not found/i.test(message)) {
        return apiJson({ error: message }, 404);
      }
      return apiJson({ error: message }, 500);
    }
  });
}
