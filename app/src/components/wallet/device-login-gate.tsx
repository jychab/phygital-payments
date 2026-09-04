"use client";

import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/phygital";
import { queryKeys, queryOptions } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  fetchDeviceSession,
  loginDevice,
  registerDevice,
} from "@/lib/wallet/device-auth-client";

/** Compulsory Login / Register before app content — no skip. */
export function DeviceLoginGate({
  children,
  keepMounted = false,
}: {
  children: ReactNode;
  /**
   * Keep children mounted while gated (e.g. cold `/token` tap verify can run
   * in parallel with session check / Login UI).
   */
  keepMounted?: boolean;
}) {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: queryKeys.deviceAuth.session(),
    queryFn: fetchDeviceSession,
    ...queryOptions.deviceSession,
  });
  const [busy, setBusy] = useState<"login" | "register" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "login" | "register") {
    setError(null);
    setBusy(kind);
    try {
      const next =
        kind === "login" ? await loginDevice() : await registerDevice();
      queryClient.setQueryData(queryKeys.deviceAuth.session(), next);
    } catch (e) {
      setError(toUserErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const loading = (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{copy.common.loading}</p>
    </div>
  );

  const loginUi = (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-display-md tracking-tight">
          {copy.wallet.deviceLoginTitle}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {error ?? copy.wallet.deviceLoginBody}
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={busy != null}
          onClick={() => void run("login")}
        >
          {busy === "login" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.deviceLoginCta
          )}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          disabled={busy != null}
          onClick={() => void run("register")}
        >
          {busy === "register" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.deviceRegisterCta
          )}
        </Button>
      </div>
    </div>
  );

  if (session.data) {
    return <>{children}</>;
  }

  const gate = session.isPending ? loading : loginUi;

  if (keepMounted) {
    return (
      <>
        <div hidden aria-hidden>
          {children}
        </div>
        {gate}
      </>
    );
  }

  return gate;
}
