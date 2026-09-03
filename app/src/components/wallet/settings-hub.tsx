"use client";

import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";

export type SettingsTarget =
  | "spendingLimits"
  | "recipients"
  | "allowedActions"
  | "signing";

/** Wallet settings hub — policy rows + signing. */
export function SettingsHub({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (target: SettingsTarget) => void;
}) {
  const rows: { id: SettingsTarget; label: string }[] = [
    { id: "spendingLimits", label: copy.wallet.spendingLimits },
    { id: "recipients", label: copy.wallet.recipients },
    { id: "allowedActions", label: copy.wallet.allowedActions },
    { id: "signing", label: copy.wallet.signing },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          {copy.common.back}
        </Button>
        <p className="text-sm font-medium">{copy.wallet.settings}</p>
        <span className="w-16" aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        {rows.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => onOpen(row.id)}
            className="flex items-center justify-between rounded-2xl bg-muted/25 px-4 py-4 text-left"
          >
            <span className="text-sm">{row.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
}
