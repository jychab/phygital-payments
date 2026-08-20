"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useIsRestoring } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { DeviceHome } from "@/components/device/device-home";
import { EmbedBoot, EmbedError } from "@/components/layout/embed-gate";
import { CenteredStatus } from "@/components/layout/gate-message";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { useIsEmbedded } from "@/hooks/layout/use-is-embedded";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { usePhygitalToken } from "@/hooks/device/use-phygital-token";
import { useTapVerify } from "@/hooks/device/use-tap-verify";
import { useAuthenticateDevice } from "@/hooks/device/use-authenticate-device";
import { fetchPhygitalTokenByPasskey, type PhygitalToken } from "@/lib/phygital/token";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { tryParseAddress } from "@/lib/solana/address";
import { toUserErrorMessage } from "@/lib/user-errors";

const DeviceWalletShell = dynamic(
  () =>
    import("@/components/device/device-wallet-shell").then(
      (m) => m.DeviceWalletShell,
    ),
  { ssr: false, loading: () => <EmbedBoot /> },
);

/**
 * Route `/device` — Hold to Check, signed NFC URL, or wallet finish.
 */
export function DeviceTapApp() {
  const embedded = useIsEmbedded();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const owner = tryParseAddress(searchParams.get("owner")?.trim() ?? "");
  const tokenAddress = tryParseAddress(
    searchParams.get("phygital")?.trim() ?? "",
  );

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
    return <DeviceWalletShell token={token} />;
  }

  if (owner && tokenAddress) {
    return (
      <DeviceWalletShell
        owner={String(owner)}
        tokenAddress={String(tokenAddress)}
      />
    );
  }

  return (
    <DeviceWalletShell>
      <DeviceTapNfcApp />
    </DeviceWalletShell>
  );
}

function DeviceTapNfcApp() {
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

  return <TokenFlow pk={pk} />;
}

function HoldToCheckLanding({ failed = false }: { failed?: boolean }) {
  const inApp = useIsInAppBrowser();
  const { authenticate, pending } = useAuthenticateDevice();
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [notRegistered, setNotRegistered] = useState(false);
  const [token, setToken] = useState<PhygitalToken | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCheck() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
    setError(null);
    setNotRegistered(false);
    try {
      const { secp256r1PublicKey } = await authenticate();
      try {
        const found = await fetchPhygitalTokenByPasskey(
          getSolanaRpc(),
          secp256r1PublicKey,
        );
        setToken(found);
      } catch {
        setNotRegistered(true);
      }
    } catch (err) {
      setError(
        toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        ),
      );
    }
  }

  if (showInAppGate) {
    return (
      <InAppBrowserGate body="To check a device, open this page in Safari or Chrome." />
    );
  }

  if (token) {
    return <DeviceHome token={token} liveConfirmed />;
  }

  if (pending) {
    return (
      <NfcHoldStatus
        size="lg"
        busy
        title="Hold Still…"
        body="Keep holding until it reads."
      />
    );
  }

  if (notRegistered) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing={false}
        title="Not Set Up"
        body="This device isn’t set up yet."
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
      body="Hold your device to the back of this phone."
      onRingClick={() => void onCheck()}
      ringAriaLabel="Hold to Check"
    />
  );
}

function TokenFlow({ pk }: { pk: string | null }) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalToken(pk);

  if (isRestoring || tokenQuery.isLoading) {
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
        body="This device isn’t set up yet."
      />
    );
  }

  return <DeviceHome token={tokenQuery.data} />;
}
