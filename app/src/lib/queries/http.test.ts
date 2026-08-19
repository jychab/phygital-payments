import { afterEach, describe, expect, it, vi } from "vitest";

import { queryFetch } from "./http";

describe("queryFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("always sets cache: no-store, even if the caller passes another mode", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await queryFetch("/api/tokens/verified", { cache: "force-cache" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tokens/verified",
      expect.objectContaining({ cache: "no-store" }),
    );
  });
});
