"use client";

import { AuthenticityBadge } from "@/components/token/authenticity-badge";
import { MotionSection } from "@/components/shared/motion-section";
import { cn } from "@/lib/utils";

/** Card title block below the slab. */
export function CardMetadata({
  name,
  collectionName,
  liveConfirmed = false,
  className,
}: {
  name: string;
  collectionName?: string | null;
  liveConfirmed?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-center",
        className,
      )}
    >
      <MotionSection staggerIndex={0}>
        <h1 className="text-display-xl tracking-tight text-foreground">
          {name}
        </h1>
      </MotionSection>
      {collectionName ? (
        <MotionSection staggerIndex={1}>
          <p className="text-sm text-muted-foreground">{collectionName}</p>
        </MotionSection>
      ) : null}
      <MotionSection staggerIndex={collectionName ? 2 : 1}>
        <AuthenticityBadge confirmed={liveConfirmed} />
      </MotionSection>
    </div>
  );
}
