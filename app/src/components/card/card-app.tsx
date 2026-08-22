"use client";

import { useState } from "react";

import { AccessoryWalletShell } from "@/components/accessory/accessory-wallet-shell";
import { PhygitalTokenGate } from "@/components/accessory/phygital-token-gate";
import { CardHome } from "@/components/card/card-home";
import { CheckingStatus } from "@/components/layout/gate-message";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { usePhygitalTokenByPasskey } from "@/hooks/accessory/use-phygital-token";
import { useTapVerify } from "@/hooks/accessory/use-tap-verify";
import { useAuthenticateAccessory } from "@/hooks/card/use-authenticate-accessory";
import { toUserErrorMessage } from "@/lib/user-errors";

export function CardApp() {
  return (
    <AccessoryWalletShell modeLabel="Card">
      <CardNfcApp />
    </AccessoryWalletShell>
  );
}

function CardNfcApp() {
  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();

  if (!hasTapProof) {
    return <HoldToCheckLanding />;
  }

  if (verifyPending || verify === "pending") {
    return <CheckingStatus />;
  }

  if (verify !== "verified" || !pk) {
    return <HoldToCheckLanding failed />;
  }

  return (
    <PhygitalTokenGate pk={pk}>
      {(token) => <CardHome token={token} />}
    </PhygitalTokenGate>
  );
}

function HoldToCheckLanding({ failed = false }: { failed?: boolean }) {
  const { authenticate, pending } = useAuthenticateAccessory();
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
        body="This accessory isn’t set up yet."
        onRingClick={() => void onCheck()}
        ringAriaLabel="Hold to Check"
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
      body="Hold your accessory to the back of this phone."
      onRingClick={() => void onCheck()}
      ringAriaLabel="Hold to Check"
    />
  );
}
