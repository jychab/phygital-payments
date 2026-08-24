"use client";

import { PhygitalAppShell } from "@/components/phygital/phygital-app-shell";
import { AccessoryTapFlow } from "@/components/phygital/accessory-tap-flow";
import { PhygitalTokenGate } from "@/components/phygital/phygital-token-gate";
import { AuthGate } from "@/components/wallet/auth-gate";
import { WalletHome } from "@/components/wallet/wallet-home";
import { NfcTapVerifiedGate } from "@/components/shared/nfc-tap-verified-gate";
import { useTapVerify } from "@/hooks/phygital/use-tap-verify";

export function WalletApp() {
  const { hasTapProof } = useTapVerify();

  if (hasTapProof) {
    return (
      <PhygitalAppShell>
        <NfcTapVerifiedGate>
          {(pk) => (
            <PhygitalTokenGate pk={pk}>
              {(token) => <AccessoryTapFlow token={token} />}
            </PhygitalTokenGate>
          )}
        </NfcTapVerifiedGate>
      </PhygitalAppShell>
    );
  }

  return (
    <PhygitalAppShell modeLabel="Wallet">
      <AuthGate>
        <WalletHome />
      </AuthGate>
    </PhygitalAppShell>
  );
}
