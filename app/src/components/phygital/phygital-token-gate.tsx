"use client";

import type { ReactNode } from "react";
import { useIsRestoring } from "@tanstack/react-query";

import { CheckingStatus } from "@/components/layout/gate-message";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { usePhygitalToken } from "@/hooks/phygital/use-phygital-token";
import type { PhygitalToken } from "@/lib/phygital/token";

export function PhygitalTokenGate({
  pk,
  children,
}: {
  pk: string;
  children: (token: PhygitalToken) => ReactNode;
}) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalToken(pk);

  if (
    isRestoring ||
    tokenQuery.isLoading ||
    !tokenQuery.isFetchedAfterMount
  ) {
    return <CheckingStatus />;
  }

  if (tokenQuery.isError || !tokenQuery.data) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing={false}
        title="Not Set Up"
        body="This accessory isn’t set up yet."
      />
    );
  }

  return children(tokenQuery.data);
}
