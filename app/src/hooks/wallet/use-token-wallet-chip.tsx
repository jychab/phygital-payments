"use client";

import { useMemo, type ReactNode } from "react";
import { Settings } from "lucide-react";

import { IdentityChip } from "@/components/shared/identity-chip";
import { useShellHeaderExtra } from "@/components/token/token-route-shell";
import { Button } from "@/components/ui/button";
import { useWalletPda } from "@/hooks/wallet/use-wallet-pda";
import { copy } from "@/lib/copy/phygital";
import type { PhygitalToken } from "@/lib/phygital/token";

/** AppShell trailing: wallet chip on every token screen; optional settings. */
export function useTokenWalletChip({
  token,
  mode,
  onOpenWallet,
  onSettings,
  enabled = true,
}: {
  token: PhygitalToken;
  mode: "open-wallet" | "copy";
  onOpenWallet?: () => void;
  onSettings?: () => void;
  /** When false, leaves header alone (another owner). */
  enabled?: boolean;
}) {
  const tokenAddress = String(token.address);
  const { walletAddress } = useWalletPda(tokenAddress);

  const extra = useMemo((): ReactNode | undefined => {
    if (!enabled) return undefined;
    if (!walletAddress) return null;
    return (
      <div className="flex items-center gap-1">
        <IdentityChip
          walletAddress={walletAddress}
          mode={mode}
          onOpenWallet={onOpenWallet}
        />
        {onSettings ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={copy.wallet.settingsAria}
            onClick={onSettings}
          >
            <Settings className="size-4" />
          </Button>
        ) : null}
      </div>
    );
  }, [enabled, walletAddress, mode, onOpenWallet, onSettings]);

  useShellHeaderExtra(extra);

  return { walletAddress };
}
