"use client";

import { useState } from "react";

import { PhygitalAppShell } from "@/components/phygital/phygital-app-shell";
import { PhygitalTokenGate } from "@/components/phygital/phygital-token-gate";
import { CardHome } from "@/components/card/card-home";
import { NfcTapVerifiedGate } from "@/components/shared/nfc-tap-verified-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { usePhygitalTokenByPasskey } from "@/hooks/phygital/use-phygital-token";
import { useTapVerify } from "@/hooks/phygital/use-tap-verify";
import { useAuthenticatePhygital } from "@/hooks/phygital/use-authenticate-phygital";
import { toUserErrorMessage } from "@/lib/user-errors";

export function CardApp() {
  return (
    <PhygitalAppShell modeLabel="Card">
      <CardNfcApp />
    </PhygitalAppShell>
  );
}

function CardNfcApp() {
  const { hasTapProof } = useTapVerify();

  if (!hasTapProof) {
    return <HoldToCheckLanding />;
  }

  return (
    <NfcTapVerifiedGate>
      {(pk) => (
        <PhygitalTokenGate pk={pk}>
          {(token) => <CardHome token={token} />}
        </PhygitalTokenGate>
      )}
    </NfcTapVerifiedGate>
  );
}

function HoldToCheckLanding({ failed = false }: { failed?: boolean }) {
  const { authenticate, pending } = useAuthenticatePhygital();
  const [passkey, setPasskey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tokenQuery = usePhygitalTokenByPasskey(passkey);

  async function onCheck() {
    setError(null);
    setPasskey(null);
    try {
      const { secp256r1PublicKey } = await authenticate();
      setPasskey(secp256r1PublicKey);
    } catch (err) {
      setError(
        toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        ),
      );
    }
  }

  if (tokenQuery.isFetchedAfterMount && tokenQuery.data) {
    return <CardHome token={tokenQuery.data} liveConfirmed />;
  }

  const checking =
    pending ||
    (Boolean(passkey) &&
      (tokenQuery.isPending ||
        tokenQuery.isFetching ||
        !tokenQuery.isFetchedAfterMount));
  if (checking) {
    return (
      <NfcHoldStatus
        size="lg"
        busy
        title="Hold Still…"
        body="Keep holding until it reads."
      />
    );
  }

  if (passkey && tokenQuery.isFetchedAfterMount && tokenQuery.data === null) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing={false}
        title="Not Set Up"
        body="This phygital token isn’t set up yet."
      />
    );
  }

  if (error || failed || (passkey && tokenQuery.isError)) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Couldn’t Verify"
        body="Hold it flat against the back of your phone and try again."
        onRingClick={() => void onCheck()}
        ringAriaLabel="Hold to Check"
      />
    );
  }

  return (
    <NfcHoldStatus
      size="lg"
      title="Hold to Check"
      body="Hold your phygital to the back of this phone."
      onRingClick={() => void onCheck()}
      ringAriaLabel="Hold to Check"
    />
  );
}
