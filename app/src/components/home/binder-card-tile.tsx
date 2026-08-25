"use client";

import { useDasCollectible } from "@/hooks/accessory/use-das-collectible";
import { fallbackCollectible } from "@/lib/tokens/collectible";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import { dashboardDetailHref } from "@/lib/journey";
import { CardTile } from "@/components/card/card-tile";

/** Single binder tile — fetches DAS metadata for the linked mint. */
export function BinderCardTile({
  token,
  index,
}: {
  token: PhygitalToken;
  index: number;
}) {
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const das = useDasCollectible(mint);
  const collectible =
    das.data ?? (das.isFetched && mint ? fallbackCollectible(mint) : null);
  const loading = das.isLoading && !das.isFetched;

  return (
    <CardTile
      href={dashboardDetailHref("card", token.address)}
      collectible={collectible}
      loading={loading}
      index={index}
    />
  );
}
