"use client";

import { useState } from "react";
import { Info } from "lucide-react";

import { CopyableAddress } from "@/components/shared/copyable-address";
import { CollectibleMetadataRow } from "@/components/token/collectible-metadata-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copy } from "@/lib/copy/phygital";
import { cn } from "@/lib/utils";

function CardIdLabel() {
  const [open, setOpen] = useState(false);

  return (
    <span className="inline-flex items-center gap-1">
      {copy.token.cardId}
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex size-4 items-center justify-center rounded-full text-muted-foreground",
              "transition-colors hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            )}
            aria-label={copy.token.cardIdHint}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            <Info className="size-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="text-left">
          {copy.token.cardIdHint}
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

/** Read-only reference — mint, mint owner, card ID. */
export function TokenDetails({
  mint,
  mintOwner,
  cardId,
  className,
}: {
  mint?: string | null;
  mintOwner?: string | null;
  /** Chip secp256r1 public key (base64url). */
  cardId?: string | null;
  className?: string;
}) {
  const hasRows = Boolean(mint) || Boolean(mintOwner) || Boolean(cardId);
  if (!hasRows) return null;

  return (
    <section className={cn("w-full text-left", className)}>
      <h2 className="text-eyebrow mb-3 text-muted-foreground">{copy.token.details}</h2>
      <div className="divide-y divide-border/40">
        {mint ? (
          <CollectibleMetadataRow label={copy.token.mintAddress}>
            <CopyableAddress address={mint} length={4} label={copy.address.mintAddress} />
          </CollectibleMetadataRow>
        ) : null}

        {mintOwner ? (
          <CollectibleMetadataRow label={copy.token.mintOwner}>
            <CopyableAddress
              address={mintOwner}
              length={4}
              label={copy.address.mintOwner}
            />
          </CollectibleMetadataRow>
        ) : null}

        {cardId ? (
          <CollectibleMetadataRow label={<CardIdLabel />}>
            <CopyableAddress address={cardId} length={4} label={copy.address.cardId} />
          </CollectibleMetadataRow>
        ) : null}
      </div>
    </section>
  );
}
