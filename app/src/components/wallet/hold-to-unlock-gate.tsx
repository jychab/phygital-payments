"use client";

import { useEffect, useState, type ReactNode } from "react";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { copy } from "@/lib/copy/phygital";
import { setTokenSessionUnlockHooks } from "@/lib/wallet/token-session";

/**
 * Full-screen Hold unlock when policy Save / Approve once get 401 session.
 * Registers hooks for `withTokenSessionRetry`.
 */
export function HoldToUnlockGate({ children }: { children: ReactNode }) {
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    setTokenSessionUnlockHooks({
      onStart: () => setUnlocking(true),
      onEnd: () => setUnlocking(false),
    });
    return () => setTokenSessionUnlockHooks({});
  }, []);

  return (
    <>
      {children}
      {unlocking ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 px-4 pt-6 backdrop-blur-sm">
          <NfcHoldStatus
            size="lg"
            pulsing
            busy
            title={copy.wallet.holdToUnlock}
            body={copy.wallet.sessionExpiredBody}
          />
        </div>
      ) : null}
    </>
  );
}
