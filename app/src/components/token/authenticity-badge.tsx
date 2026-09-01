"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";

import { CollectibleMetadataRow } from "@/components/token/collectible-metadata-group";
import { copy } from "@/lib/copy/phygital";

/** Verification metadata row — Not verified or Verified (tappable). */
export function VerificationMetadataRow({
  liveConfirmed,
  onVerifyAgain,
}: {
  liveConfirmed: boolean;
  /** When liveConfirmed — runs a fresh hold-to-verify. */
  onVerifyAgain?: () => void;
}) {
  if (liveConfirmed) {
    const canRecheck = Boolean(onVerifyAgain);
    return (
      <CollectibleMetadataRow
        label={copy.token.verification}
        onPress={canRecheck ? onVerifyAgain : undefined}
        trailing={
          canRecheck ? (
            <RefreshCw className="size-3.5 text-muted-foreground" aria-hidden />
          ) : undefined
        }
        subtitle={
          canRecheck ? (
            <>
              <span className="font-medium text-foreground/80">{copy.verify.verifyAgain}</span>
              <span className="text-muted-foreground">
                {" · "}
                {copy.verify.verifyAgainHint}
              </span>
            </>
          ) : undefined
        }
      >
        <span
          className="inline-flex items-center gap-1 font-medium text-success"
          aria-label={canRecheck ? copy.verify.verifiedRecheckAria : copy.verify.verified}
        >
          <CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
          {copy.verify.verified}
        </span>
      </CollectibleMetadataRow>
    );
  }

  return (
    <CollectibleMetadataRow label={copy.token.verification} subtitle={copy.verify.notVerifiedHint}>
      <span className="font-medium text-muted-foreground">{copy.verify.notVerified}</span>
    </CollectibleMetadataRow>
  );
}
