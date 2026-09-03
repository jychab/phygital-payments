"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { copy } from "@/lib/copy/phygital";
import type { WalletCollectible } from "@/lib/wallet/portfolio-types";
import { collectibleInterfaceLabel } from "@/lib/wallet/send-asset-ref";

/** Collectible detail — art, collection, interface badge, Send. */
export function CollectibleDetailSheet({
  collectible,
  open,
  onOpenChange,
  onSend,
  onOpenCard,
}: {
  collectible: WalletCollectible | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (c: WalletCollectible) => void;
  onOpenCard?: () => void;
}) {
  if (!collectible) return null;

  const badge = collectibleInterfaceLabel(collectible);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[90vh] max-w-lg overflow-y-auto rounded-t-3xl"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="pr-8">{collectible.name}</SheetTitle>
          {collectible.collectionName ? (
            <p className="text-sm text-muted-foreground">
              {collectible.collectionName}
            </p>
          ) : null}
        </SheetHeader>

        <div className="mt-4 space-y-4 px-4 pb-6">
          <div className="overflow-hidden rounded-2xl bg-muted">
            {collectible.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={collectible.image}
                alt=""
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="aspect-square w-full bg-muted" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-medium">
              {badge}
            </span>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => {
                onSend(collectible);
                onOpenChange(false);
              }}
            >
              {copy.wallet.send}
            </Button>
            {onOpenCard ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  onOpenCard();
                  onOpenChange(false);
                }}
              >
                {copy.wallet.openCard}
              </Button>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
