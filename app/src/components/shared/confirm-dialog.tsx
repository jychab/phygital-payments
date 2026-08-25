"use client";

import { useEffect, useRef } from "react";

import { ModalSheet } from "@/components/shared/modal-sheet";
import { Button } from "@/components/ui/button";
import { galleryAnimate } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Lightweight in-app confirm — replaces window.confirm for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  return (
    <ModalSheet open={open} onClose={onCancel} title={title} align="center">
      <div
        role="alertdialog"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={body ? "confirm-dialog-body" : undefined}
        className={cn(
          "rounded-2xl border border-border bg-card p-5 shadow-lg",
          galleryAnimate.scaleIn,
        )}
      >
        <h2
          id="confirm-dialog-title"
          className="font-(family-name:--font-display) text-lg tracking-tight"
        >
          {title}
        </h2>
        {body ? (
          <p id="confirm-dialog-body" className="mt-2 text-sm text-muted-foreground">
            {body}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            ref={cancelRef}
            type="button"
            variant="ghost"
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </ModalSheet>
  );
}
