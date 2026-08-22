"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useIsRestoring } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { AccessoryHome } from "@/components/accessory/accessory-home";
import { AppBoot } from "@/components/layout/app-shell";
import { CenteredStatus } from "@/components/layout/gate-message";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import {
  usePhygitalToken,
  usePhygitalTokenByPasskey,
} from "@/hooks/accessory/use-phygital-token";
import { useTapVerify } from "@/hooks/accessory/use-tap-verify";
import { useAuthenticateAccessory } from "@/hooks/accessory/use-authenticate-accessory";
import { toUserErrorMessage } from "@/lib/user-errors";

const AccessoryWalletShell = dynamic(
  () =>
    import("@/components/accessory/accessory-wallet-shell").then(
      (m) => m.AccessoryWalletShell,
    ),
  { ssr: false, loading: () => <AppBoot /> },
);

/**
 * Hold to Check or signed NFC URL.
 * `/` never looks up a mint; `/cards` shows collectible art when one is linked.
 */
export function AccessoryApp({
  showCollectible = false,
  modeLabel = "Accessory",
}: {
  showCollectible?: boolean;
  modeLabel?: string;
}) {
  return (
    <AccessoryWalletShell modeLabel={modeLabel}>
      <AccessoryNfcApp showCollectible={showCollectible} />
    </AccessoryWalletShell>
  );
}

function AccessoryNfcApp({ showCollectible }: { showCollectible: boolean }) {
  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();

  if (!hasTapProof) {
    return <HoldToCheckLanding showCollectible={showCollectible} />;
  }

  if (verifyPending || verify === "pending") {
    return <CheckingStatus />;
  }

  if (verify !== "verified") {
    return <HoldToCheckLanding showCollectible={showCollectible} failed />;
  }

  return <AccessoryFlow pk={pk} showCollectible={showCollectible} />;
}

function HoldToCheckLanding({
  showCollectible,
  failed = false,
}: {
  showCollectible: boolean;
  failed?: boolean;
}) {
  const { authenticate } = useAuthenticateAccessory();
  const [busy, setBusy] = useState(false);
  const [passkey, setPasskey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tokenQuery = usePhygitalTokenByPasskey(passkey);

  async function onCheck() {
    setError(null);
    setPasskey(null);
    setBusy(true);
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
    } finally {
      setBusy(false);
    }
  }

  if (tokenQuery.isFetchedAfterMount && tokenQuery.data) {
    return (
      <AccessoryHome
        token={tokenQuery.data}
        liveConfirmed
        showCollectible={showCollectible}
      />
    );
  }

  const checking =
    busy ||
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

  if (passkey && tokenQuery.isError) {
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

  if (error || failed) {
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

function AccessoryFlow({
  pk,
  showCollectible,
}: {
  pk: string | null;
  showCollectible: boolean;
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

  return (
    <AccessoryHome token={tokenQuery.data} showCollectible={showCollectible} />
  );
}

function CheckingStatus() {
  return (
    <CenteredStatus>
      <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Checking…</p>
    </CenteredStatus>
  );
}
