import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import {
  readWebauthnSession,
  writeWebauthnSession,
  WEBAUTHN_SESSION_TTL_MS,
} from "./webauthn-session";

describe("webauthn-session", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", globalThis);
    vi.stubGlobal(
      "sessionStorage",
      (() => {
        const store = new Map<string, string>();
        return {
          getItem: (key: string) => store.get(key) ?? null,
          setItem: (key: string, value: string) => {
            store.set(key, value);
          },
          removeItem: (key: string) => {
            store.delete(key);
          },
          clear: () => store.clear(),
        };
      })(),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("round-trips a session within TTL", () => {
    writeWebauthnSession("abc123");
    expect(readWebauthnSession()?.secp256r1PublicKey).toBe("abc123");
  });

  it("expires after TTL", () => {
    writeWebauthnSession("abc123");
    vi.advanceTimersByTime(WEBAUTHN_SESSION_TTL_MS + 1);
    expect(readWebauthnSession()).toBeNull();
  });
});
