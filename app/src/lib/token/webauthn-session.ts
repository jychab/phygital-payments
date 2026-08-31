/** Matches tap counter grace — same physical visit, no second NFC tap. */
export const WEBAUTHN_SESSION_TTL_MS = 15 * 60 * 1000;

const STORAGE_KEY = "phygital.webauthnSession";

export type WebauthnSession = {
  secp256r1PublicKey: string;
  verifiedAt: number;
};

export function readWebauthnSession(): WebauthnSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<WebauthnSession>;
    const secp256r1PublicKey = parsed.secp256r1PublicKey?.trim();
    const verifiedAt =
      typeof parsed.verifiedAt === "number" ? parsed.verifiedAt : NaN;
    if (!secp256r1PublicKey || !Number.isFinite(verifiedAt)) return null;
    if (Date.now() - verifiedAt > WEBAUTHN_SESSION_TTL_MS) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return { secp256r1PublicKey, verifiedAt };
  } catch {
    return null;
  }
}

export function writeWebauthnSession(secp256r1PublicKey: string): void {
  if (typeof window === "undefined") return;
  try {
    const session: WebauthnSession = {
      secp256r1PublicKey,
      verifiedAt: Date.now(),
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* private mode / blocked */
  }
}

export function clearWebauthnSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
