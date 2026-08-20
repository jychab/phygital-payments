"use client";

import { useEffect, useState } from "react";

export function formatCountdown(seconds: number): string {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatRemaining(ms: number): string {
  return formatCountdown(Math.ceil(ms / 1000));
}

/** Countdown to an absolute expiry timestamp. */
export function ExpiryCountdown({
  expiresAtMs,
  className,
}: {
  expiresAtMs: number;
  className?: string;
}) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, expiresAtMs - Date.now()),
  );

  useEffect(() => {
    const tick = () => setRemainingMs(Math.max(0, expiresAtMs - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiresAtMs]);

  const expired = remainingMs <= 0;

  return (
    <p className={className}>
      {expired
        ? "This expired. Hold your device to your phone again."
        : `Finish within ${formatRemaining(remainingMs)}`}
    </p>
  );
}
