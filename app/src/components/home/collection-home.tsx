"use client";

import Link from "next/link";
import { useIsRestoring } from "@tanstack/react-query";
import { Nfc } from "lucide-react";

import { BinderCardTile } from "@/components/home/binder-card-tile";
import { CollectionTokenMenu } from "@/components/home/collection-token-menu";
import { GateMessage } from "@/components/layout/gate-message";
import { AccessoryIdentity } from "@/components/shared/accessory-identity";
import { LoadingStatus } from "@/components/shared/loading-status";
import { MotionSection } from "@/components/shared/motion-section";
import { Button } from "@/components/ui/button";
import { usePrefetchDasCollectibles } from "@/hooks/token/use-das-collectible";
import { usePhygitalTokensByOwner } from "@/hooks/home/use-phygital-tokens-by-owner";
import { collectionDetailHref } from "@/lib/journey";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";
import { cn } from "@/lib/utils";
import { accessoryListClass, collectionGridClass } from "@/lib/layout";

/** Collection hub — cards grid + accessories. */
export function CollectionHome({ owner }: { owner: string }) {
  const isRestoring = useIsRestoring();
  const tokensQuery = usePhygitalTokensByOwner(owner);

  if (isRestoring || tokensQuery.isLoading) {
    return <LoadingStatus label="Loading your collection…" />;
  }

  if (tokensQuery.isError) {
    return (
      <GateMessage
        icon={<Nfc className="size-5 text-destructive" />}
        title="Couldn’t load collection"
        body={toUserErrorMessage(
          tokensQuery.error,
          "Check your connection and try again.",
        )}
        destructive
        action={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void tokensQuery.refetch()}
            disabled={tokensQuery.isFetching}
          >
            Try again
          </Button>
        }
      />
    );
  }

  const tokens = tokensQuery.data ?? [];
  const cards = tokens.filter(tokenHasLinkedMint);
  const accessories = tokens.filter((t) => !tokenHasLinkedMint(t));

  return (
    <CollectionBody owner={owner} cards={cards} accessories={accessories} />
  );
}

function CollectionBody({
  owner,
  cards,
  accessories,
}: {
  owner: string;
  cards: PhygitalToken[];
  accessories: PhygitalToken[];
}) {
  const cardMints = cards.map((t) => String(t.mint));
  usePrefetchDasCollectibles(cardMints);

  return (
    <div className="flex flex-1 flex-col gap-8 pb-4">
      <MotionSection>
        <div className="min-w-0">
          <h1 className="text-display-xl tracking-tight md:text-[1.75rem] lg:text-3xl">
            Your Collection
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
            {accessories.length > 0
              ? ` · ${accessories.length} ${accessories.length === 1 ? "accessory" : "accessories"}`
              : ""}
          </p>
        </div>
      </MotionSection>

      {cards.length > 0 ? (
        <section aria-label="Cards">
          <div className={collectionGridClass}>
            {cards.map((token, index) => (
              <BinderCardTile
                key={token.address}
                owner={owner}
                token={token}
                index={index}
              />
            ))}
          </div>
        </section>
      ) : (
        <MotionSection variant="fade">
          <GateMessage
            icon={<Nfc className="size-5 text-muted-foreground" />}
            title="No cards yet"
            body="Tap a card to the back of your phone to add it to your collection."
          />
        </MotionSection>
      )}

      {accessories.length > 0 ? (
        <AccessoriesSection owner={owner} accessories={accessories} />
      ) : null}
    </div>
  );
}

function AccessoriesSection({
  owner,
  accessories,
}: {
  owner: string;
  accessories: PhygitalToken[];
}) {
  return (
    <MotionSection staggerIndex={2} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-foreground">Accessories</h2>
        <span className="text-xs text-muted-foreground">{accessories.length}</span>
      </div>
      <ul className={accessoryListClass}>
        {accessories.map((token) => (
          <li key={token.address}>
            <AccessoryRow owner={owner} token={token} />
          </li>
        ))}
      </ul>
    </MotionSection>
  );
}

function AccessoryRow({
  owner,
  token,
}: {
  owner: string;
  token: PhygitalToken;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-0.5 rounded-xl border border-border/60 bg-card/40",
        "transition-colors duration-150 hover:bg-card/60",
      )}
    >
      <Link
        href={collectionDetailHref(token.address)}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-3 px-3.5 py-3",
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <AccessoryIdentity token={token} />
      </Link>
      <CollectionTokenMenu
        owner={owner}
        token={token}
        noun="accessory"
        className="mr-1.5"
      />
    </div>
  );
}
