"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
        ? "Tap proof expired — tap your NFC device again in Safari."
        : `Finish within ${formatRemaining(remainingMs)} (~3 min from tap)`}
    </p>
  );
}
