"use client";

import { CheckCircle2, Nfc } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";

export function WhatsNextPanel({
  spendEnabled,
  onAddMoney,
  onTurnOnTapToPay,
  onDone,
}: {
  spendEnabled: boolean;
  onAddMoney: () => void;
  onTurnOnTapToPay: () => void;
  onDone: () => void;
}) {
  if (spendEnabled) {
    return (
      <GateMessage
        icon={<CheckCircle2 className="size-5 text-success" />}
        title="You're ready"
        body="Pay by holding this accessory to any phone or NFC reader. You can change limits anytime from this accessory in your wallet."
        action={
          <div className="flex w-full max-w-64 flex-col gap-3">
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={onAddMoney}
            >
              Add money
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              className="w-full"
              onClick={onDone}
            >
              Got it
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <GateMessage
      icon={<Nfc className="size-5" />}
      title="Accessory linked"
      body="Turn on tap to pay when you want this chip to spend from your wallet. You can change limits anytime from this accessory in your wallet."
      action={
        <div className="flex w-full max-w-64 flex-col gap-3">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onTurnOnTapToPay}
          >
            Turn on tap to pay
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            onClick={onAddMoney}
          >
            Add money
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onDone}
          >
            Got it
          </Button>
        </div>
      }
    />
  );
}
