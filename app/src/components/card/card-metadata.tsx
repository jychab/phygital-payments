"use client";

import { AuthenticityBadge } from "@/components/card/authenticity-badge";
import { MotionSection } from "@/components/shared/motion-section";
import { cn } from "@/lib/utils";

/** Card title block below the slab. */
export function CardMetadata({
  name,
  collectionName,
  liveConfirmed = false,
  showBadge = true,
  align = "center",
  className,
}: {
  name: string;
  collectionName?: string | null;
  liveConfirmed?: boolean;
  showBadge?: boolean;
  align?: "center" | "start";
  className?: string;
}) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        centered ? "items-center text-center" : "items-start text-left",
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
      {showBadge ? (
        <MotionSection staggerIndex={collectionName ? 2 : 1}>
          <AuthenticityBadge confirmed={liveConfirmed} />
        </MotionSection>
      ) : null}
    </div>
  );
}
