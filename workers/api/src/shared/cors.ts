import { cors } from "hono/cors";

/** Browser origins allowed to call this Worker with credentials. */
export const appCors = cors({
  origin: (origin) => {
    if (!origin) return "*";
    try {
      const host = new URL(origin).hostname;
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.endsWith(".revibase.com") ||
        host === "revibase.com"
      ) {
        return origin;
      }
    } catch {
      /* ignore */
    }
    return null;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Accept"],
  credentials: true,
  maxAge: 86400,
});
