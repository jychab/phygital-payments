import {
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";

/** Minted tokens live on `/card`; everything else stays on `/accessory`. */
export type PhygitalSurface = "card" | "accessory";

export function surfaceForToken(
  token: Pick<PhygitalToken, "mint">,
): PhygitalSurface {
  return tokenHasLinkedMint(token) ? "card" : "accessory";
}

export function surfaceFromPathname(pathname: string): PhygitalSurface | null {
  if (pathname === "/card" || pathname.startsWith("/card/")) return "card";
  if (pathname === "/accessory" || pathname.startsWith("/accessory/")) {
    return "accessory";
  }
  return null;
}

export function phygitalHref(
  surface: PhygitalSurface,
  search = "",
): string {
  const qs = search.replace(/^\?/, "");
  return `/${surface}${qs ? `?${qs}` : ""}`;
}

/** Pending-claim handoff URL. Defaults to `/accessory` when the token is unknown. */
export function claimHref(
  pendingToken: string,
  token?: Pick<PhygitalToken, "mint">,
): string {
  return phygitalHref(
    token ? surfaceForToken(token) : "accessory",
    `token=${encodeURIComponent(pendingToken)}`,
  );
}

export function phygitalNoun(surface: PhygitalSurface): "card" | "accessory" {
  return surface;
}
