"use client";

import { useConnector } from "@solana/connector/react";
import { LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";

import { ModalSheet } from "@/components/shared/modal-sheet";
import { Button } from "@/components/ui/button";
import {
  setWalletPickerOpen,
  useWalletPickerOpen,
} from "@/hooks/wallet/use-solana-address";
import { toUserErrorMessage } from "@/lib/user-errors";
import { cn } from "@/lib/utils";

/**
 * Overlay wallet list opened by `useSolanaAddress().connect()`.
 * Mounted once from `WalletRoot`.
 */
export function WalletConnectPicker() {
  const open = useWalletPickerOpen();
  const { connectors, connectWallet, isConnecting, isConnected } =
    useConnector();

  const show = open && !isConnected;
  const installed = connectors.filter((c) => c.ready);
  const list = installed.length > 0 ? installed : connectors;

  return (
    <ModalSheet
      open={show}
      onClose={() => setWalletPickerOpen(false)}
      title="Connect wallet"
      align="bottom"
      className="rounded-2xl border border-border/60 bg-background p-4 shadow-lg"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium tracking-tight">Connect wallet</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          aria-label="Close"
          onClick={() => setWalletPickerOpen(false)}
        >
          <X className="size-4" />
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No Solana wallets detected. Install Phantom, Solflare, or Backpack.
        </p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {list.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={isConnecting || !c.ready}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border border-border/50 px-3 py-2.5 text-left text-sm",
                  "transition-colors hover:bg-muted/40",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
                onClick={() => {
                  void connectWallet(c.id)
                    .then(() => {
                      setWalletPickerOpen(false);
                    })
                    .catch((err) => {
                      toast.error(
                        toUserErrorMessage(err, "Couldn’t connect wallet"),
                      );
                    });
                }}
              >
                {c.icon ? (
                  // Wallet-standard icons are data: URLs.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.icon}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 shrink-0 rounded-md"
                  />
                ) : (
                  <span className="size-7 shrink-0 rounded-md bg-muted" />
                )}
                <span className="flex-1 font-medium">{c.name}</span>
                {!c.ready ? (
                  <span className="text-xs text-muted-foreground">
                    Not installed
                  </span>
                ) : isConnecting ? (
                  <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </ModalSheet>
  );
}
