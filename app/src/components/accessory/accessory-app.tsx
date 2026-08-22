"use client";

import { AccessoryHome } from "@/components/accessory/accessory-home";
import { AccessoryWalletShell } from "@/components/accessory/accessory-wallet-shell";
import { PhygitalTokenGate } from "@/components/accessory/phygital-token-gate";
import { AuthGate } from "@/components/wallet/auth-gate";
import { CheckingStatus } from "@/components/layout/gate-message";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { useTapVerify } from "@/hooks/accessory/use-tap-verify";

export function AccessoryApp() {
  return (
    <AccessoryWalletShell>
      <AccessoryNfcApp />
    </AccessoryWalletShell>
  );
}

function AccessoryNfcApp() {
  const { pk, hasTapProof, verify, verifyPending } = useTapVerify();

  if (!hasTapProof) {
    return <NeedTapStatus />;
  }

  if (verifyPending || verify === "pending") {
    return <CheckingStatus />;
  }

  if (verify !== "verified" || !pk) {
    return <NeedTapStatus failed />;
  }

  return (
    <PhygitalTokenGate pk={pk}>
      {(token) => (
        <AuthGate>
          <AccessoryHome token={token} />
        </AuthGate>
      )}
    </PhygitalTokenGate>
  );
}

function NeedTapStatus({ failed = false }: { failed?: boolean }) {
  return (
    <NfcHoldStatus
      size="lg"
      pulsing={!failed}
      title={failed ? "Couldn’t Verify" : "Tap your accessory"}
      body={
        failed
          ? "Hold it flat against the back of your phone and try again."
          : "Hold your accessory to the back of this phone."
      }
    />
  );
}
