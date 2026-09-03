import { Hono } from "hono";

import { json } from "@/shared/http";
import { tryParseAddress } from "@/shared/solana/address";
import { getErrorMessage } from "@/shared/utils";
import {
  fetchDasCollectible,
  fetchDasCollectibles,
} from "@/tokens/das-collectible";
import { fetchWalletPortfolioServer } from "@/tokens/portfolio";
import { loadMintedCollectibleView } from "@/tokens/minted-view";
import { getCollectibleRarityForMint } from "@/tokens/collection-rarity";
import { fetchCollectibleShortcuts } from "@/tokens/shortcuts";

const MAX_BATCH = 50;

export const tokenRoutes = new Hono();

tokenRoutes.get("/tokens/portfolio", async (c) => {
  const ownerRaw = c.req.query("owner")?.trim() ?? "";
  const owner = tryParseAddress(ownerRaw);
  if (!owner) {
    return json(
      { error: "Query param owner must be a valid Solana address" },
      { status: 400 },
    );
  }

  try {
    const portfolio = await fetchWalletPortfolioServer(String(owner));
    return json(portfolio);
  } catch (error) {
    return json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load portfolio",
      },
      { status: 502 },
    );
  }
});

tokenRoutes.get("/tokens/collectible", async (c) => {
  const idRaw = c.req.query("id")?.trim() ?? "";
  const id = tryParseAddress(idRaw);
  if (!id) {
    return json(
      { error: "Query param id must be a valid Solana address" },
      { status: 400 },
    );
  }

  try {
    const collectible = await fetchDasCollectible(String(id));
    return json({ collectible });
  } catch (error) {
    return json(
      { error: getErrorMessage(error, "Failed to load collectible") },
      { status: 502 },
    );
  }
});

tokenRoutes.post("/tokens/collectible/batch", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const idsRaw =
    body &&
    typeof body === "object" &&
    "ids" in body &&
    Array.isArray((body as { ids: unknown }).ids)
      ? (body as { ids: unknown[] }).ids
      : null;

  if (!idsRaw || idsRaw.length === 0) {
    return json(
      { error: "Body must include a non-empty ids array" },
      { status: 400 },
    );
  }

  if (idsRaw.length > MAX_BATCH) {
    return json(
      { error: `At most ${MAX_BATCH} ids per request` },
      { status: 400 },
    );
  }

  const ids: string[] = [];
  for (const raw of idsRaw) {
    if (typeof raw !== "string") {
      return json(
        { error: "Each id must be a string Solana address" },
        { status: 400 },
      );
    }
    const id = tryParseAddress(raw.trim());
    if (!id) {
      return json(
        { error: `Invalid Solana address: ${raw}` },
        { status: 400 },
      );
    }
    ids.push(String(id));
  }

  try {
    const collectibles = await fetchDasCollectibles(ids);
    return json({ collectibles });
  } catch (error) {
    return json(
      { error: getErrorMessage(error, "Failed to load collectibles") },
      { status: 502 },
    );
  }
});

tokenRoutes.get("/tokens/minted", async (c) => {
  const idRaw = c.req.query("id")?.trim() ?? "";
  const id = tryParseAddress(idRaw);
  if (!id) {
    return json(
      { error: "Query param id must be a valid Solana address" },
      { status: 400 },
    );
  }

  try {
    const view = await loadMintedCollectibleView(String(id));
    return json(view);
  } catch (error) {
    return json(
      { error: getErrorMessage(error, "Failed to load collectible view") },
      { status: 502 },
    );
  }
});

tokenRoutes.get("/tokens/rarity", async (c) => {
  const idRaw = c.req.query("id")?.trim() ?? "";
  const id = tryParseAddress(idRaw);
  if (!id) {
    return json(
      { error: "Query param id must be a valid Solana address" },
      { status: 400 },
    );
  }

  try {
    const collectible = await fetchDasCollectible(String(id));
    if (!collectible?.collectionMint) {
      return json({ rarity: null });
    }

    const rarity = await getCollectibleRarityForMint({
      mint: String(id),
      collectionMint: collectible.collectionMint,
      attributes: collectible.attributes,
    });

    return json({ rarity });
  } catch (error) {
    return json(
      { error: getErrorMessage(error, "Failed to load rarity") },
      { status: 502 },
    );
  }
});

tokenRoutes.get("/tokens/shortcuts", async (c) => {
  const externalUrl = c.req.query("externalUrl")?.trim() ?? "";
  const collectionMint = c.req.query("collectionMint")?.trim() || null;

  if (!externalUrl.startsWith("https://")) {
    return json({ shortcuts: [] });
  }

  const shortcuts = await fetchCollectibleShortcuts(
    externalUrl,
    collectionMint,
  );
  return json({ shortcuts });
});
