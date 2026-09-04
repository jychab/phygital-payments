"use client";

import { useMemo, type ReactNode } from "react";

import { IdentityChip } from "@/components/shared/identity-chip";
import { useShellHeaderExtra } from "@/components/token/token-route-shell";

/** Card-only AppShell trailing control — toggles mint metadata ↔ wallet. */
export function useTokenWalletChip({
  onToggle,
  viewingWallet = false,
  enabled = true,
}: {
  onToggle: () => void;
  /** When true, control returns to mint metadata. */
  viewingWallet?: boolean;
  enabled?: boolean;
}) {
  const extra = useMemo((): ReactNode | undefined => {
    if (!enabled) return undefined;
    return (
      <IdentityChip viewingWallet={viewingWallet} onToggle={onToggle} />
    );
  }, [enabled, viewingWallet, onToggle]);

  useShellHeaderExtra(extra);
}
