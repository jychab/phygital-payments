import { describe, expect, it } from "vitest";

import { runWithRequestStore } from "@/shared/request-context";
import {
  findSessionInCookies,
  mintSessionToken,
  sessionCookieName,
} from "@/auth/token-session";

const mockEnv = {
  POLICY_SESSION_SECRET: "test-session-secret",
} as unknown as Env;

function withEnv<T>(fn: () => T): T {
  return runWithRequestStore({ env: mockEnv, waitUntil: () => undefined }, fn);
}

describe("per-token session cookies", () => {
  it("uses a distinct cookie name per phygital token", () => {
    expect(sessionCookieName("TokenA1111111111111111111111111111111111111")).not.toBe(
      sessionCookieName("TokenB1111111111111111111111111111111111111"),
    );
  });

  it("keeps two accessory sessions independently addressable", async () => {
    const now = 1_700_000_000_000;
    const a = "TokenA1111111111111111111111111111111111111";
    const b = "TokenB1111111111111111111111111111111111111";

    const minted = await withEnv(async () => {
      const sessionA = await mintSessionToken({
        phygitalToken: a,
        secp256r1PublicKey: "pk-a",
        now,
      });
      const sessionB = await mintSessionToken({
        phygitalToken: b,
        secp256r1PublicKey: "pk-b",
        now,
      });
      return { sessionA, sessionB };
    });

    const cookies = {
      [sessionCookieName(a)]: minted.sessionA.token,
      [sessionCookieName(b)]: minted.sessionB.token,
    };

    const foundA = await withEnv(() =>
      findSessionInCookies(cookies, { phygitalToken: a }, now + 1_000),
    );
    const foundB = await withEnv(() =>
      findSessionInCookies(cookies, { phygitalToken: b }, now + 1_000),
    );
    const foundByPkB = await withEnv(() =>
      findSessionInCookies(cookies, { secp256r1PublicKey: "pk-b" }, now + 1_000),
    );

    expect(foundA?.phygitalToken).toBe(a);
    expect(foundA?.secp256r1PublicKey).toBe("pk-a");
    expect(foundB?.phygitalToken).toBe(b);
    expect(foundByPkB?.phygitalToken).toBe(b);
    expect(foundA?.jti).not.toBe(foundB?.jti);
  });

  it("does not return another accessory's cookie", async () => {
    const now = 1_700_000_000_000;
    const a = "TokenA1111111111111111111111111111111111111";
    const b = "TokenB1111111111111111111111111111111111111";
    const mintedB = await withEnv(() =>
      mintSessionToken({
        phygitalToken: b,
        secp256r1PublicKey: "pk-b",
        now,
      }),
    );

    const found = await withEnv(() =>
      findSessionInCookies(
        { [sessionCookieName(b)]: mintedB.token },
        { phygitalToken: a },
        now + 1_000,
      ),
    );
    expect(found).toBeNull();
  });
});
