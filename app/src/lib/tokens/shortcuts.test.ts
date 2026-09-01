import { describe, expect, it } from "vitest";

import {
  filterShortcutChips,
  isShortcutUriAllowed,
  parseCollectibleShortcuts,
  pickPrimaryCtaShortcut,
  resolveShortcutUri,
  rootDomainOf,
  sharesRootDomain,
  shortcutOpensExternally,
  shortcutsJsonUrl,
} from "./shortcuts";

const COLLECTION = "J1S9H3QjnRtBbbuD4HjPV6RpRhwuk4zKbxsnCHuTgh9w";
const EXTERNAL = "https://madlads.com";

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

describe("rootDomainOf", () => {
  it("extracts the registrable root domain", () => {
    expect(rootDomainOf("https://madlads.com")).toBe("madlads.com");
    expect(rootDomainOf("https://app.madlads.com/play")).toBe("madlads.com");
  });
});

describe("sharesRootDomain", () => {
  it("matches apex and subdomains", () => {
    expect(sharesRootDomain("https://app.madlads.com", EXTERNAL)).toBe(true);
    expect(sharesRootDomain("https://other.com", EXTERNAL)).toBe(false);
  });
});

describe("isShortcutUriAllowed", () => {
  it("allows external targets on any https origin", () => {
    expect(
      isShortcutUriAllowed("https://x.com/project", EXTERNAL, true),
    ).toBe(true);
  });

  it("requires same root domain when prefersExternalTarget is false", () => {
    expect(
      isShortcutUriAllowed("https://madlads.com/stake", EXTERNAL, false),
    ).toBe(true);
    expect(
      isShortcutUriAllowed("https://app.madlads.com/play", EXTERNAL, false),
    ).toBe(true);
    expect(
      isShortcutUriAllowed("https://other.com/page", EXTERNAL, false),
    ).toBe(false);
  });

  it("always allows solana uris", () => {
    expect(
      isShortcutUriAllowed("solana:abc", EXTERNAL, false),
    ).toBe(true);
  });
});

describe("shortcutOpensExternally", () => {
  it("treats solana and prefersExternalTarget as external", () => {
    expect(
      shortcutOpensExternally({
        label: "Tip",
        uri: "solana:abc",
      }),
    ).toBe(true);
    expect(
      shortcutOpensExternally({
        label: "X",
        uri: "https://x.com",
        prefersExternalTarget: true,
      }),
    ).toBe(true);
    expect(
      shortcutOpensExternally({
        label: "Play",
        uri: "https://madlads.com/play",
        prefersExternalTarget: false,
      }),
    ).toBe(false);
  });
});

describe("resolveShortcutUri", () => {
  it("substitutes phantom placeholders", () => {
    expect(
      resolveShortcutUri(
        "https://game.example/play/{{tokenId}}/{{ownerAddress}}?c={{collectionId}}",
        {
          tokenId: "mint123",
          ownerAddress: "owner456",
          collectionId: "col789",
        },
      ),
    ).toBe(
      "https://game.example/play/mint123/owner456?c=col789",
    );
  });
});

describe("pickPrimaryCtaShortcut", () => {
  it("returns the first primaryCta shortcut", () => {
    const shortcuts = [
      { label: "A", uri: "https://a.com" },
      { label: "B", uri: "https://b.com", primaryCta: true },
      { label: "C", uri: "https://c.com", primaryCta: true },
    ];
    expect(pickPrimaryCtaShortcut(shortcuts)?.label).toBe("B");
  });

  it("returns null when none marked", () => {
    expect(
      pickPrimaryCtaShortcut([{ label: "A", uri: "https://a.com" }]),
    ).toBeNull();
  });
});

describe("filterShortcutChips", () => {
  it("removes the primary shortcut from chips", () => {
    const primary = {
      label: "Play",
      uri: "https://madlads.com/play",
      primaryCta: true,
    };
    const shortcuts = [
      primary,
      { label: "Website", uri: "https://madlads.com" },
    ];
    expect(filterShortcutChips(shortcuts, primary)).toEqual([
      { label: "Website", uri: "https://madlads.com" },
    ]);
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
        EXTERNAL,
      ),
    ).toEqual([
      {
        label: "Website",
        uri: "https://madlads.com",
        icon: "view",
        prefersExternalTarget: false,
      },
      {
        label: "Stake",
        uri: "https://madlads.com/stake",
        icon: null,
        prefersExternalTarget: false,
      },
    ]);
  });

  it("parses primaryCta and prefersExternalTarget", () => {
    expect(
      parseCollectibleShortcuts(
        {
          shortcuts: [
            {
              label: "Play",
              uri: "https://madlads.com/play",
              primaryCta: true,
              prefersExternalTarget: false,
            },
            {
              label: "X",
              uri: "https://x.com/project",
              prefersExternalTarget: true,
            },
          ],
        },
        COLLECTION,
        EXTERNAL,
      ),
    ).toEqual([
      {
        label: "Play",
        uri: "https://madlads.com/play",
        icon: null,
        primaryCta: true,
        prefersExternalTarget: false,
      },
      {
        label: "X",
        uri: "https://x.com/project",
        icon: null,
        prefersExternalTarget: true,
      },
    ]);
  });

  it("allows in-app shortcuts on subdomains of external_url root domain", () => {
    expect(
      parseCollectibleShortcuts(
        {
          shortcuts: [
            {
              label: "Play",
              uri: "https://app.madlads.com/play",
              prefersExternalTarget: false,
            },
          ],
        },
        COLLECTION,
        EXTERNAL,
      ),
    ).toEqual([
      {
        label: "Play",
        uri: "https://app.madlads.com/play",
        icon: null,
        prefersExternalTarget: false,
      },
    ]);
  });

  it("drops in-app shortcuts outside external_url root domain", () => {
    expect(
      parseCollectibleShortcuts(
        {
          shortcuts: [
            {
              label: "Off domain",
              uri: "https://other.com/page",
              prefersExternalTarget: false,
            },
          ],
        },
        COLLECTION,
        EXTERNAL,
      ),
    ).toEqual([]);
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
          uri: "https://madlads.com/other",
          limitToCollections: ["OtherMint1111111111111111111111111111111"],
        },
      ],
    };
    expect(parseCollectibleShortcuts(doc, COLLECTION, EXTERNAL)).toEqual([
      {
        label: "Only Mad Lads",
        uri: "https://madlads.com",
        icon: null,
        prefersExternalTarget: false,
      },
    ]);
    expect(parseCollectibleShortcuts(doc, null, EXTERNAL)).toEqual([]);
  });

  it("returns empty for invalid docs", () => {
    expect(parseCollectibleShortcuts(null, null)).toEqual([]);
    expect(parseCollectibleShortcuts({}, null)).toEqual([]);
    expect(parseCollectibleShortcuts({ shortcuts: "nope" }, null)).toEqual([]);
  });
});
