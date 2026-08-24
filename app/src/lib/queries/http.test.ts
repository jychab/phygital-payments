import { afterEach, describe, expect, it, vi } from "vitest";

import { queryFetch } from "./http";

describe("queryFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("prefixes /api URLs with NEXT_PUBLIC_API_ORIGIN", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "http://localhost:8787");

    await queryFetch("/api/verify-tap", { cache: "force-cache" });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8787/api/verify-tap",
      expect.objectContaining({ cache: "no-store", credentials: "include" }),
    );
  });

  it("uses the production API origin when configured", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("NEXT_PUBLIC_API_ORIGIN", "https://api.revibase.com");

    await queryFetch("/api/verify-tap");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.revibase.com/api/verify-tap",
      expect.objectContaining({ cache: "no-store", credentials: "include" }),
    );
  });
});
