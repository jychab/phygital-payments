import {
  fetchMaybePhygitalTokenByPasskeyCached,
  fetchPhygitalTokenByIdentifierCached,
  wireToken,
} from "@/lib/server/phygital-token-lookup";
import { apiJson } from "@/lib/server/api-response";
import { toUserErrorMessage } from "@/lib/user-errors";

export const runtime = "nodejs";

export async function GET(req: Request) {
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
      const token = await fetchPhygitalTokenByIdentifierCached(identifier);
      return apiJson({ token: wireToken(token) });
    }
    const token = await fetchMaybePhygitalTokenByPasskeyCached(passkey!);
    return apiJson({ token: token ? wireToken(token) : null });
  } catch (error) {
    const message = toUserErrorMessage(error, "Couldn’t load phygital");
    if (/not found/i.test(message)) {
      return apiJson({ error: message }, 404);
    }
    return apiJson({ error: message }, 500);
  }
}
