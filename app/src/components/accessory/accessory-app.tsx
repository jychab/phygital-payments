"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useIsRestoring } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { AccessoryHome } from "@/components/accessory/accessory-home";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CenteredStatus } from "@/components/layout/gate-message";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
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
  { ssr: false, loading: () => <EmbedBoot /> },
);

/**
 * Route `/accessory` — Hold to Check, signed NFC URL, or wallet finish.
 */
export function AccessoryApp() {
  const embedded = useIsEmbedded();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  if (embedded === null) {
    return <EmbedBoot />;
  }

  if (embedded) {
    return (
      <EmbedError
        title="Can’t open here"
        body="Open this on your phone, not in this window."
      />
    );
  }

  if (token) {
    return <AccessoryWalletShell token={token} />;
  }

  return (
    <AccessoryWalletShell>
      <AccessoryNfcApp />
    </AccessoryWalletShell>
  );
}

function AccessoryNfcApp() {
  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();

  if (!hasTapProof) {
    return <HoldToCheckLanding />;
  }

  if (verifyPending || verify === "pending") {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Checking…</p>
      </CenteredStatus>
    );
  }

  if (verify !== "verified") {
    return <HoldToCheckLanding failed />;
  }

  return <AccessoryFlow pk={pk} />;
}

function HoldToCheckLanding({ failed = false }: { failed?: boolean }) {
  const inApp = useIsInAppBrowser();
  const { authenticate } = useAuthenticateAccessory();
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [passkey, setPasskey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tokenQuery = usePhygitalTokenByPasskey(passkey);

  async function onCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
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

  if (showInAppGate) {
    return (
      <InAppBrowserGate body="To check an accessory, open this page in Safari or Chrome." />
    );
  }

  if (tokenQuery.isFetchedAfterMount && tokenQuery.data) {
    return <AccessoryHome token={tokenQuery.data} liveConfirmed />;
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

function AccessoryFlow({ pk }: { pk: string | null }) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalToken(pk);

  if (
    isRestoring ||
    tokenQuery.isLoading ||
    !tokenQuery.isFetchedAfterMount
  ) {
    return (
      <CenteredStatus>
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Checking…</p>
      </CenteredStatus>
    );
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

  return <AccessoryHome token={tokenQuery.data} />;
}
