"use client";

import { toast } from "sonner";
import { Smartphone } from "lucide-react";

import { GateMessage } from "@/components/layout/gate-message";
import { Button } from "@/components/ui/button";

/** Block WebAuthn NFC steps inside wallet / social in-app browsers. */
export function InAppBrowserGate({
  body = "This step only works in Safari or Chrome. Copy this link and open it in your phone’s browser.",
}: {
  body?: string;
}) {
  const href = typeof window !== "undefined" ? window.location.href : "";

  return (
    <GateMessage
      icon={<Smartphone className="size-5 text-muted-foreground" />}
      title="Open in Safari or Chrome"
      body={body}
      action={
        <div className="flex w-full max-w-64 flex-col gap-2.5">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full"
            onClick={() => {
              void navigator.clipboard.writeText(href).then(
                () => toast.success("Link copied"),
                () => toast.error("Couldn’t copy link"),
              );
            }}
          >
            Copy link
          </Button>
        </div>
      }
    />
  );
}
