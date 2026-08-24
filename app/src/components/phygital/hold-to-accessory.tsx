"use client";

import { useCallback, useEffect, useState } from "react";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { useAuthenticatePhygital } from "@/hooks/phygital/use-authenticate-phygital";
import { usePhygitalTokenByPasskey } from "@/hooks/phygital/use-phygital-token";
import type { PhygitalToken } from "@/lib/phygital/token";
import { toUserErrorMessage } from "@/lib/user-errors";

/** In-app NFC hold that resolves to a token (wallet “Hold to add”). */
export function HoldToAccessory({
  title = "Hold to add",
  body = "Hold your accessory to the back of this phone.",
  started,
  onFound,
}: {
  title?: string;
  body?: string;
  /** Auth started in the same click that opened this screen (WebAuthn gesture). */
  started?: Promise<{ secp256r1PublicKey: string }> | null;
  onFound: (token: PhygitalToken) => void;
}) {
  const { authenticate, pending } = useAuthenticatePhygital();
  const [passkey, setPasskey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [awaitingStart, setAwaitingStart] = useState(() => Boolean(started));
  const tokenQuery = usePhygitalTokenByPasskey(passkey);

  const applyResult = useCallback(async (attempt: Promise<{ secp256r1PublicKey: string }>) => {
    setError(null);
    setPasskey(null);
    try {
      const { secp256r1PublicKey } = await attempt;
      setPasskey(secp256r1PublicKey);
    } catch (err) {
      setError(
        toUserErrorMessage(
          err,
          "Hold it flat against the back of your phone and try again.",
        ),
      );
    }
  }, []);

  const onCheck = useCallback(async () => {
    await applyResult(authenticate());
  }, [authenticate, applyResult]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    setAwaitingStart(true);
    void applyResult(started).finally(() => {
      if (!cancelled) setAwaitingStart(false);
    });
    return () => {
      cancelled = true;
    };
  }, [started, applyResult]);

  useEffect(() => {
    if (tokenQuery.data) onFound(tokenQuery.data);
  }, [onFound, tokenQuery.data]);

  const checking =
    awaitingStart ||
    pending ||
    (Boolean(passkey) &&
      (tokenQuery.isPending ||
        tokenQuery.isFetching ||
        !tokenQuery.isFetchedAfterMount) &&
      !tokenQuery.data);
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
      />
    );
  }

  if (error || (passkey && tokenQuery.isError)) {
    return (
      <NfcHoldStatus
        size="lg"
        title="Couldn’t Verify"
        body="Hold it flat against the back of your phone and try again."
        onRingClick={() => void onCheck()}
        ringAriaLabel={title}
      />
    );
  }

  return (
    <NfcHoldStatus
      size="lg"
      title={title}
      body={body}
      onRingClick={() => void onCheck()}
      ringAriaLabel={title}
    />
  );
}
