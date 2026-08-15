/**
 * Detect wallet / social in-app browsers where WebAuthn NFC typically fails.
 */

const IAB_PATTERNS: RegExp[] = [
  /Phantom/i,
  /Solflare/i,
  /Backpack/i,
  /OKX/i,
  /Jupiter/i,
  /FBAN|FBAV|FB_IAB|Instagram/i,
  /Line\//i,
  /MicroMessenger/i,
  /Twitter/i,
  /LinkedInApp/i,
  /Snapchat/i,
  /Discord/i,
  /wv\)/i,
];

export function isInAppBrowser(
  userAgent: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
): boolean {
  if (!userAgent) return false;
  if (typeof window !== "undefined") {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (
      nav.standalone === true ||
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      return false;
    }
  }
  return IAB_PATTERNS.some((re) => re.test(userAgent));
}

/** Best-effort “open in system browser” URL for iOS. */
export function safariOpenHintUrl(
  href: string = typeof window !== "undefined" ? window.location.href : "",
): string {
  try {
    const url = new URL(href);
    if (url.protocol === "https:") {
      return `x-safari-https://${url.host}${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    /* ignore */
  }
  return href;
}
