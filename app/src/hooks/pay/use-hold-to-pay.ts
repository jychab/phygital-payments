"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import {
  cancelPreauthForWallet,
  requestPreauthForWallet,
  waitPreauthStatusForWallet,
  type PreauthStatusResult,
} from "@/lib/pay/preauth-client";
import { invalidateOwnerQueries } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";

export type HoldToPayPhase =
  | "idle"
  | "window"
  | "expired"
  | "cancelled"
  | "replaced"
  | "success";

export type HoldToPaySuccess = Extract<
  PreauthStatusResult,
  { status: "success" }
>;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}

/**
 * Arm / cancel / wait for a Confirm-Payments preauth window.
 * Shared by HoldToPayPanel and authenticity-integrated Pay CTAs.
 */
export function useHoldToPay(owner: string) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<HoldToPayPhase>("idle");
  const [grantId, setGrantId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [paid, setPaid] = useState<HoldToPaySuccess | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const windowOpen = phase === "window";
  const secondsLeft =
    expiresAt != null && expiresAt * 1000 > nowMs
      ? Math.max(0, Math.ceil((expiresAt * 1000 - nowMs) / 1000))
      : 0;

  useEffect(() => {
    if (!windowOpen || expiresAt == null) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [windowOpen, expiresAt]);

  useEffect(() => {
    if (!windowOpen || grantId == null) return;
    const ac = new AbortController();
    void waitPreauthStatusForWallet({
      wallet: owner,
      grantId,
      signal: ac.signal,
    })
      .then((result) => {
        if (result.status === "success") {
          setPaid(result);
          setPhase("success");
          invalidateOwnerQueries(queryClient, owner);
          return;
        }
        setPaid(null);
        setPhase(result.status);
      })
      .catch((error) => {
        if (isAbortError(error) || ac.signal.aborted) return;
        toast.error(toUserErrorMessage(error, "Couldn’t check this payment."));
        setPhase("expired");
      })
      .finally(() => {
        if (!ac.signal.aborted) setExpiresAt(null);
      });
    return () => ac.abort();
  }, [windowOpen, grantId, owner, queryClient]);

  async function onPay() {
    try {
      setBusy(true);
      const grant = await requestPreauthForWallet({ wallet: owner });
      setPaid(null);
      setNowMs(Date.now());
      setGrantId(grant.grantId);
      setExpiresAt(grant.expiresAt);
      setPhase("window");
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t start this payment."));
    } finally {
      setBusy(false);
    }
  }

  async function onCancelWindow() {
    try {
      await cancelPreauthForWallet({ wallet: owner });
    } catch (error) {
      toast.error(toUserErrorMessage(error, "Couldn’t cancel."));
    }
  }

  function resetToIdle() {
    setPhase("idle");
    setGrantId(null);
    setExpiresAt(null);
    setPaid(null);
  }

  return {
    phase,
    busy,
    windowOpen,
    secondsLeft,
    paid,
    /** Non-idle — authenticity should yield to phase UI. */
    showPhase: phase !== "idle",
    onPay,
    onCancelWindow,
    resetToIdle,
  };
}
