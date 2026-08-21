import { describe, expect, it } from "vitest";

import { collectibleFromDas, type DasCollectibleAsset } from "./collectible";

const MINT = "F9Lw3ki3hJ7PF9HQXsBzoY8GyE6sPoEZZdXJBsTTD2rk";

function asset(overrides: DasCollectibleAsset = {}): DasCollectibleAsset {
  return { id: MINT, ...overrides };
}

describe("collectibleFromDas", () => {
  it("maps name, cdn image, and collection metadata", () => {
    expect(
      collectibleFromDas(
        asset({
          content: {
            metadata: { name: "Mad Lads #8420" },
            links: { image: "https://example.com/fallback.png" },
            files: [
              {
                uri: "https://example.com/raw.png",
                cdn_uri: "https://cdn.helius-rpc.com/image.png",
              },
            ],
          },
          grouping: [
            {
              group_key: "collection",
              group_value: "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w",
              collection_metadata: { name: "Mad Lads" },
            },
          ],
        }),
      ),
    ).toEqual({
      mint: MINT,
      name: "Mad Lads #8420",
      image: "https://cdn.helius-rpc.com/image.png",
      collectionName: "Mad Lads",
    });
  });

  it("falls back to links.image when files have no https uri", () => {
    expect(
      collectibleFromDas(
        asset({
          content: {
            metadata: { name: "Chip" },
            links: { image: "https://arweave.net/abc" },
            files: [
              { uri: "ipfs://not-https" },
              { uri: "http://insecure.example/raw.png" },
            ],
          },
        }),
      )?.image,
    ).toBe("https://arweave.net/abc");
  });

  it("falls back to a short mint when name is missing but image is present", () => {
    expect(
      collectibleFromDas(
        asset({
          content: {
            links: { image: "https://example.com/nft.png" },
          },
        }),
      ),
    ).toEqual({
      mint: MINT,
      name: "F9Lw…D2rk",
      image: "https://example.com/nft.png",
      collectionName: null,
    });
  });

  it("keeps a name-only collectible when there is no image", () => {
    expect(
      collectibleFromDas(
        asset({
          content: { metadata: { name: "  Named  " } },
          grouping: [{ group_key: "collection", group_value: "abc" }],
        }),
      ),
    ).toEqual({
      mint: MINT,
      name: "Named",
      image: null,
      collectionName: null,
    });
  });

  it("returns null when there is neither a name nor an image", () => {
    expect(collectibleFromDas(null)).toBeNull();
    expect(collectibleFromDas(undefined)).toBeNull();
    expect(collectibleFromDas({})).toBeNull();
    expect(collectibleFromDas(asset({ content: {} }))).toBeNull();
  });
});
