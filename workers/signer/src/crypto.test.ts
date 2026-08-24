import { describe, expect, it } from "vitest";

import { openSecret, sealSecret } from "./crypto";

const SECRET = "test-app-encryption-secret";

describe("signer crypto", () => {
  it("round-trips a session secret", async () => {
    const plain = "dGVzdC1zZWNyZXQta2V5LWJ5dGVz";
    const sealed = await sealSecret(SECRET, plain);
    expect(sealed.startsWith("enc:v1:")).toBe(true);
    expect(sealed).not.toContain(plain);
    expect(await openSecret(SECRET, sealed)).toBe(plain);
  });

  it("rejects plaintext values", async () => {
    await expect(openSecret(SECRET, "plaintext-base64")).rejects.toThrow(
      /not encrypted/i,
    );
  });
});
