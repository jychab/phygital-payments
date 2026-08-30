import { describe, expect, it } from "vitest";

import {
  parseCollectibleShortcuts,
  shortcutsJsonUrl,
} from "./shortcuts";

const COLLECTION = "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w";

describe("shortcutsJsonUrl", () => {
  it("appends shortcuts.json to https external urls", () => {
    expect(shortcutsJsonUrl("https://madlads.com")).toBe(
      "https://madlads.com/shortcuts.json",
    );
    expect(shortcutsJsonUrl("https://madlads.com/path/")).toBe(
      "https://madlads.com/path/shortcuts.json",
    );
  });

  it("rejects non-https urls", () => {
    expect(shortcutsJsonUrl("http://madlads.com")).toBeNull();
    expect(shortcutsJsonUrl("ipfs://foo")).toBeNull();
    expect(shortcutsJsonUrl("not-a-url")).toBeNull();
  });
});

describe("parseCollectibleShortcuts", () => {
  it("keeps collectible / mobile shortcuts with https uris", () => {
    expect(
      parseCollectibleShortcuts(
        {
          version: 2,
          shortcuts: [
            {
              label: "Website",
              uri: "https://madlads.com",
              icon: "view",
              type: "collectible",
              platform: "all",
            },
            {
              label: "Stake",
              uri: "https://madlads.com/stake",
              platform: "mobile",
            },
            {
              label: "Desktop only",
              uri: "https://madlads.com/desk",
              platform: "desktop",
            },
            {
              label: "Fungible",
              uri: "https://example.com",
              type: "fungible",
            },
            { label: "Bad", uri: "javascript:alert(1)" },
          ],
        },
        COLLECTION,
      ),
    ).toEqual([
      { label: "Website", uri: "https://madlads.com", icon: "view" },
      { label: "Stake", uri: "https://madlads.com/stake", icon: null },
    ]);
  });

  it("respects limitToCollections when provided", () => {
    const doc = {
      shortcuts: [
        {
          label: "Only Mad Lads",
          uri: "https://madlads.com",
          limitToCollections: [COLLECTION],
        },
        {
          label: "Other",
          uri: "https://example.com",
          limitToCollections: ["OtherMint1111111111111111111111111111111"],
        },
      ],
    };
    expect(parseCollectibleShortcuts(doc, COLLECTION)).toEqual([
      { label: "Only Mad Lads", uri: "https://madlads.com", icon: null },
    ]);
    expect(parseCollectibleShortcuts(doc, null)).toEqual([]);
  });

  it("returns empty for invalid docs", () => {
    expect(parseCollectibleShortcuts(null, null)).toEqual([]);
    expect(parseCollectibleShortcuts({}, null)).toEqual([]);
    expect(parseCollectibleShortcuts({ shortcuts: "nope" }, null)).toEqual([]);
  });
});
