"use client";

import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

import { CheckingStatus, GateMessage } from "@/components/layout/gate-message";
import { useTapVerify } from "@/hooks/phygital/use-tap-verify";

export function NfcTapVerifiedGate({
  children,
}: {
  children: (pk: string) => ReactNode;
}) {
  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();

  if (!hasTapProof) return null;

  if (verifyPending || verify === "pending") {
    return <CheckingStatus />;
  }

  if (verify !== "verified" || !pk) {
    return (
      <GateMessage
        icon={<CircleAlert className="size-5 text-muted-foreground" />}
        title="Couldn’t Verify"
        body="Hold it flat against the back of your phone and try again."
      />
    );
  }

  return children(pk);
}
