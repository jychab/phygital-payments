"use client";

import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { LoadingStatus } from "@/components/shared/loading-status";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { copy } from "@/lib/copy/phygital";
import { queryKeys, queryOptions } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  fetchDeviceLinks,
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

  function onAuthSuccess(
    next: Awaited<ReturnType<typeof loginDevice>>,
  ) {
    queryClient.setQueryData(queryKeys.deviceAuth.session(), next);
    void queryClient.prefetchQuery({
      queryKey: queryKeys.deviceAuth.links(),
      queryFn: fetchDeviceLinks,
      ...queryOptions.deviceLinks,
    });
  }

  const loginMutation = useMutation({
    mutationFn: loginDevice,
    onSuccess: onAuthSuccess,
  });
  const registerMutation = useMutation({
    mutationFn: registerDevice,
    onSuccess: onAuthSuccess,
  });

  const busy = loginMutation.isPending || registerMutation.isPending;
  const authError = loginMutation.error ?? registerMutation.error;

  const loading = <LoadingStatus />;

  const loginUi = (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="space-y-2">
        <h1 className="text-display-md tracking-tight">
          {copy.wallet.deviceLoginTitle}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {authError
            ? toUserErrorMessage(authError)
            : copy.wallet.deviceLoginBody}
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={() => {
            registerMutation.reset();
            loginMutation.mutate();
          }}
        >
          {loginMutation.isPending ? (
            <Spinner className="size-4" />
          ) : (
            copy.wallet.deviceLoginCta
          )}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          disabled={busy}
          onClick={() => {
            loginMutation.reset();
            registerMutation.mutate();
          }}
        >
          {registerMutation.isPending ? (
            <Spinner className="size-4" />
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
