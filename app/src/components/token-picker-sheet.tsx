"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { LoaderCircle, Search, X } from "lucide-react";

import { TokenListRow } from "@/components/token-chip";
import { Button } from "@/components/ui/button";
import { useVerifiedTokens } from "@/hooks/use-verified-tokens";
import {
  filterPaymentTokens,
  type PaymentToken,
} from "@/lib/payments/payment-token";
import { cn } from "@/lib/utils";

const ROW_HEIGHT = 56;

/**
 * Full-screen sheet for Collect mint selection (verified catalog + local search).
 */
export function TokenPickerSheet({
  open,
  onClose,
  selectedMint,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selectedMint: string;
  onSelect: (token: PaymentToken) => void;
}) {
  const titleId = useId();
  const [query, setQuery] = useState("");
  const verified = useVerifiedTokens();
  const catalog = verified.data ?? [];
  const tokens = useMemo(
    () => filterPaymentTokens(catalog, query),
    [catalog, query],
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 flex h-[85dvh] w-full max-w-md flex-col",
          "rounded-t-2xl border border-border/60 bg-background shadow-xl sm:rounded-2xl",
          "motion-safe:animate-[wallet-rise_0.35s_cubic-bezier(0.22,1,0.36,1)]",
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <p id={titleId} className="text-sm font-medium text-foreground">
            Choose token
          </p>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="shrink-0 px-4 pt-3">
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search verified tokens"
              autoFocus
              className={cn(
                "h-10 w-full rounded-xl border border-border/60 bg-muted/30 pr-3 pl-9 text-sm",
                "outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
            />
          </label>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Jupiter verified · classic SPL only
            {!verified.isLoading && catalog.length > 0
              ? ` · ${tokens.length.toLocaleString()}${
                  query.trim() ? ` of ${catalog.length.toLocaleString()}` : ""
                }`
              : null}
          </p>
        </div>

        <div className="min-h-0 flex-1 px-2 py-3">
          {verified.isLoading ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <LoaderCircle className="size-5 animate-spin" />
            </div>
          ) : tokens.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No verified tokens match.
            </p>
          ) : (
            <VirtualTokenList
              tokens={tokens}
              selectedMint={selectedMint}
              onSelect={(token) => {
                onSelect(token);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function VirtualTokenList({
  tokens,
  selectedMint,
  onSelect,
}: {
  tokens: PaymentToken[];
  selectedMint: string;
  onSelect: (token: PaymentToken) => void;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: tokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  });

  useEffect(() => {
    const idx = tokens.findIndex((t) => t.mint === selectedMint);
    if (idx >= 0) {
      virtualizer.scrollToIndex(idx, { align: "center" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens, selectedMint]);

  return (
    <div ref={parentRef} className="h-full overflow-y-auto">
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          const token = tokens[item.index]!;
          return (
            <div
              key={token.mint}
              className="absolute top-0 left-0 w-full"
              style={{
                height: item.size,
                transform: `translateY(${item.start}px)`,
              }}
            >
              <TokenListRow
                token={token}
                selected={token.mint === selectedMint}
                onSelect={() => onSelect(token)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
