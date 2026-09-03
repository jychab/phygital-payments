"use client";

import { Nfc } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useIsRestoring, useQuery, useQueryClient } from "@tanstack/react-query";

import { GateMessage } from "@/components/layout/gate-message";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { TokenRouteShell } from "@/components/token/token-route-shell";
import { LoadingStatus } from "@/components/shared/loading-status";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { useIsInAppBrowser } from "@/hooks/layout/use-is-in-app-browser";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { usePhygitalTokenByAddress } from "@/hooks/token/use-phygital-token";
import { markWebauthnVerified } from "@/hooks/token/use-webauthn-session";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import type { ShellLayout } from "@/lib/layout";
import { copy } from "@/lib/copy/phygital";
import { queryKeys, queryOptions } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  fetchActiveTokenSession,
  mintTokenSessionViaHold,
  type ActiveTokenSession,
} from "@/lib/wallet/token-session";

function layoutForToken(token: PhygitalToken): ShellLayout {
  return tokenHasLinkedMint(token) ? "gallery" : "compact";
}

function sessionMatchesToken(
  session: ActiveTokenSession | null,
  token: PhygitalToken,
): boolean {
  return (
    session != null &&
    session.phygitalToken === String(token.address) &&
    session.secp256r1PublicKey === token.secp256r1PublicKey
  );
}

/** Session-gated token home — Recents, Hold, tap, and `?address=` all enter here. */
export function TokenAddressRoute({
  tokenAddress,
  renderHome,
}: {
  tokenAddress: string;
  renderHome: (args: {
    token: PhygitalToken;
    liveConfirmed?: boolean;
  }) => ReactNode;
}) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalTokenByAddress(tokenAddress);
  // Persisted cache is client-only. First paint must match SSR (no data).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const token = hydrated && !isRestoring ? tokenQuery.data : undefined;
  const sessionQuery = useQuery({
    queryKey: queryKeys.tokenSession.byToken(tokenAddress),
    queryFn: () => fetchActiveTokenSession(tokenAddress),
    enabled: Boolean(token),
    ...queryOptions.volatile,
  });
  const session = sessionQuery.data ?? null;
  const unlocked = Boolean(token && sessionMatchesToken(session, token));

  useEffect(() => {
    if (!unlocked || !session) return;
    markWebauthnVerified(session.secp256r1PublicKey);
  }, [unlocked, session]);

  const layout: ShellLayout =
    unlocked && token ? layoutForToken(token) : "compact";
  const waitingToken =
    !hydrated ||
    isRestoring ||
    (!token &&
      (tokenQuery.isPending ||
        tokenQuery.isLoading ||
        tokenQuery.isFetching));
  const waitingSession = Boolean(token) && sessionQuery.isPending && !unlocked;

  return (
    <TokenRouteShell layout={layout}>
      {unlocked && token ? (
        renderHome({ token, liveConfirmed: true })
      ) : waitingToken || waitingSession ? (
        <LoadingStatus label={copy.common.loading} />
      ) : token ? (
        <AddressHoldGate
          token={token}
          tokenAddress={tokenAddress}
          checkError={
            sessionQuery.isError
              ? toUserErrorMessage(sessionQuery.error)
              : null
          }
        />
      ) : (
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title={copy.token.itemLoadFailed}
          body={toUserErrorMessage(
            tokenQuery.error,
            copy.token.itemNotOnChain,
          )}
        />
      )}
    </TokenRouteShell>
  );
}

function AddressHoldGate({
  token,
  tokenAddress,
  checkError,
}: {
  token: PhygitalToken;
  tokenAddress: string;
  checkError: string | null;
}) {
  const inApp = useIsInAppBrowser();
  const queryClient = useQueryClient();
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);
  const [showInAppGate, setShowInAppGate] = useState(false);
  const [holding, setHolding] = useState(false);
  const [holdError, setHoldError] = useState<string | null>(null);

  async function holdToOpen() {
    if (inApp) {
      setShowInAppGate(true);
      return;
    }
    setHoldError(null);
    setHolding(true);
    try {
      const minted = await mintTokenSessionViaHold();
      if (!sessionMatchesToken(minted, token)) {
        throw new Error(copy.token.wrongItem);
      }
      queryClient.setQueryData(
        queryKeys.tokenSession.byToken(tokenAddress),
        minted,
      );
      markWebauthnVerified(minted.secp256r1PublicKey);
    } catch (err) {
      setHoldError(toUserErrorMessage(err, copy.verify.failedBody));
    } finally {
      setHolding(false);
    }
  }

  if (showInAppGate) {
    return <InAppBrowserGate body={copy.gate.openInBrowserBody} />;
  }

  if (holding) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing
        busy
        imageSrc={collectible?.image}
        imageAlt={collectible?.name ?? ""}
        title={copy.verify.holdStill}
        body={copy.verify.holdStillBody}
      />
    );
  }

  const error = holdError ?? checkError;

  return (
    <NfcHoldStatus
      size="lg"
      pulsing={false}
      imageSrc={collectible?.image}
      imageAlt={collectible?.name ?? ""}
      title={error ? copy.verify.failed : copy.verify.holdToCheck}
      body={error ?? copy.verify.introBody}
      action={
        <Button
          type="button"
          size="lg"
          className="w-full"
          onClick={() => void holdToOpen()}
        >
          {error ? copy.common.tryAgain : copy.verify.holdToCheck}
        </Button>
      }
    />
  );
}
