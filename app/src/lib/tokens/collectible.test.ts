import { describe, expect, it } from "vitest";

import { collectibleFromDas, fallbackCollectible, type DasCollectibleAsset } from "./collectible";

const MINT = "F9Lw3ki3hJ7PF9HQXsBzoY8GyE6sPoEZZdXJBsTTD2rk";
const COLLECTION = "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w";

function asset(overrides: DasCollectibleAsset = {}): DasCollectibleAsset {
  return { id: MINT, ...overrides };
}

describe("collectibleFromDas", () => {
  it("maps name, cdn image, collection, description, attributes, and external url", () => {
    expect(
      collectibleFromDas(
        asset({
          content: {
            metadata: {
              name: "Mad Lads #8420",
              description: "A legendary Mad Lad.",
              attributes: [
                { trait_type: "Background", value: "Blue" },
                { trait_type: "Hat", value: "Crown" },
                { traitType: "Empty", value: "  " },
              ],
            },
            links: {
              image: "https://example.com/fallback.png",
              external_url: "https://madlads.com",
            },
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
              group_value: COLLECTION,
              collection_metadata: {
                name: "Mad Lads",
                image: "https://cdn.helius-rpc.com/collection.png",
                description: "The Mad Lads collection.",
              },
            },
          ],
        }),
      ),
    ).toEqual({
      mint: MINT,
      name: "Mad Lads #8420",
      image: "https://cdn.helius-rpc.com/image.png",
      collectionName: "Mad Lads",
      collectionImage: "https://cdn.helius-rpc.com/collection.png",
      collectionDescription: "The Mad Lads collection.",
      collectionMint: COLLECTION,
      description: "A legendary Mad Lad.",
      attributes: [
        { traitType: "Background", value: "Blue" },
        { traitType: "Hat", value: "Crown" },
      ],
      externalUrl: "https://madlads.com",
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
      collectionImage: null,
      collectionDescription: null,
      collectionMint: null,
      description: null,
      attributes: [],
      externalUrl: null,
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
      collectionImage: null,
      collectionDescription: null,
      collectionMint: "abc",
      description: null,
      attributes: [],
      externalUrl: null,
    });
  });

  it("ignores non-https collection images", () => {
    expect(
      collectibleFromDas(
        asset({
          content: { metadata: { name: "Chip" } },
          grouping: [
            {
              group_key: "collection",
              group_value: COLLECTION,
              collection_metadata: {
                name: "Demo",
                image: "ipfs://bag",
              },
            },
          ],
        }),
      ),
    ).toMatchObject({
      collectionName: "Demo",
      collectionImage: null,
      collectionDescription: null,
      collectionMint: COLLECTION,
    });
  });

  it("returns null when there is neither a name nor an image", () => {
    expect(collectibleFromDas(null)).toBeNull();
    expect(collectibleFromDas(undefined)).toBeNull();
    expect(collectibleFromDas({})).toBeNull();
    expect(collectibleFromDas(asset({ content: {} }))).toBeNull();
  });
});

describe("fallbackCollectible", () => {
  it("uses a short mint as the name when DAS has no metadata", () => {
    expect(fallbackCollectible(MINT)).toEqual({
      mint: MINT,
      name: "F9Lw…D2rk",
      image: null,
      collectionName: null,
      collectionImage: null,
      collectionDescription: null,
      collectionMint: null,
      description: null,
      attributes: [],
      externalUrl: null,
    });
  });
});
