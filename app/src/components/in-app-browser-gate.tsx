"use client";

import { toast } from "sonner";
import { ExternalLink, Smartphone } from "lucide-react";

import { GateMessage } from "@/components/gate-message";
import { Button } from "@/components/ui/button";
import { safariOpenHintUrl } from "@/lib/browser/in-app-browser";

/** Block WebAuthn NFC steps inside wallet / social in-app browsers. */
export function InAppBrowserGate({
  body = "NFC only works in Safari or Chrome. Open this page in your phone’s browser, then try again.",
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
        <div className="flex w-full max-w-64 flex-col gap-2">
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={() => {
              window.location.href = safariOpenHintUrl(href);
            }}
          >
            <ExternalLink className="size-3.5" />
            Open in Safari
          </Button>
          <Button
            type="button"
            size="sm"
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
