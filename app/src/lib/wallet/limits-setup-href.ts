/** Deep links for Home setup → return into wallet Limits screens. */

import {
  getQueryErrorStatus,
  QueryHttpError,
} from "@/lib/queries/http";
import { tokenHomeHref } from "@/lib/wallet/token-home-href";

export type PolicySetupScreen =
  | "spendingLimits"
  | "recipients"
  | "extraPrograms";

const SETUP_SCREENS = new Set<string>([
  "spendingLimits",
  "recipients",
  "extraPrograms",
]);

export function isPolicySetupScreen(
  value: string | null | undefined,
): value is PolicySetupScreen {
  return Boolean(value && SETUP_SCREENS.has(value));
}

export function tokenLimitsReturnPath(
  token: string,
  screen: PolicySetupScreen,
): string {
  return `${tokenHomeHref(token)}&screen=${encodeURIComponent(screen)}`;
}

/**
 * Parse a same-origin `/token?address=&screen=` return path.
 * Rejects absolute/protocol-relative URLs and unknown screens.
 */
export function parseSetupReturnPath(
  raw: string | null | undefined,
): { token: string; screen: PolicySetupScreen; path: string } | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/token")) return null;
  if (trimmed.startsWith("//") || /[\x00-\x1f\\]/.test(trimmed)) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) return null;
  try {
    const u = new URL(trimmed, "https://revibase.invalid");
    if (u.username || u.password || u.host !== "revibase.invalid") return null;
    if (u.pathname !== "/token") return null;
    const address = u.searchParams.get("address")?.trim();
    if (!address) return null;
    const screen = u.searchParams.get("screen");
    if (!isPolicySetupScreen(screen)) return null;
    return {
      token: address,
      screen,
      path: tokenLimitsReturnPath(address, screen),
    };
  } catch {
    return null;
  }
}

/** Home setup intent from `/?setup=limits&return=/token?...`. */
export function parseLimitsSetupIntent(args: {
  setup: string | null;
  returnPath: string | null;
}): { token: string; screen: PolicySetupScreen; returnTo: string } | null {
  if (args.setup !== "limits") return null;
  const parsed = parseSetupReturnPath(args.returnPath);
  if (!parsed) return null;
  return {
    token: parsed.token,
    screen: parsed.screen,
    returnTo: parsed.path,
  };
}

/** Home URL that runs Sign in / link, then returns to the wallet sheet. */
export function limitsSetupHomeHref(args: {
  token: string;
  screen: PolicySetupScreen;
}): string {
  const params = new URLSearchParams({
    setup: "limits",
    return: tokenLimitsReturnPath(args.token, args.screen),
  });
  return `/?${params.toString()}`;
}

/** True when owner APIs need Home re-auth / re-link. */
export function isOwnerAuthFailure(e: unknown): boolean {
  const status = getQueryErrorStatus(e);
  const code = e instanceof QueryHttpError ? e.code : null;
  return (
    status === 401 ||
    status === 403 ||
    code === "not_owner" ||
    code === "device_session_required"
  );
}

export function redirectToLimitsSetup(
  token: string,
  screen: PolicySetupScreen = "spendingLimits",
): void {
  window.location.assign(limitsSetupHomeHref({ token, screen }));
}

/** Redirect to Home setup when owner APIs return 401/403. */
export function handleOwnerAuthFailure(
  token: string,
  e: unknown,
  screen: PolicySetupScreen = "spendingLimits",
): boolean {
  if (!isOwnerAuthFailure(e)) return false;
  redirectToLimitsSetup(token, screen);
  return true;
}
