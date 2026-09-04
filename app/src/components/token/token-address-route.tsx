"use client";

import { Nfc } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useIsRestoring, useQuery, useQueryClient } from "@tanstack/react-query";
import { findPhygitalTokenPda } from "phygital-token-sdk";

import { GateMessage } from "@/components/layout/gate-message";
import { InAppBrowserGate } from "@/components/shared/in-app-browser-gate";
import { TokenRouteShell } from "@/components/token/token-route-shell";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { useAccessoryHold } from "@/hooks/token/use-accessory-hold";
import { useResolvedDasCollectible } from "@/hooks/token/use-das-collectible";
import { usePhygitalTokenByAddress } from "@/hooks/token/use-phygital-token";
import { tokenHasLinkedMint, type PhygitalToken } from "@/lib/phygital/token";
import type { ShellLayout } from "@/lib/layout";
import { copy } from "@/lib/copy/phygital";
import { queryKeys, queryOptions } from "@/lib/queries";
import { QueryHttpError } from "@/lib/queries/http";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  clearAllPossession,
  clearPossessionToken,
  fetchLinkStatus,
  holdAccessoryAuth,
  hasFreshPossession,
  linkToken,
  peekAccessoryProof,
  peekPossessionToken,
  storeAccessoryProof,
  type LinkStatus,
} from "@/lib/wallet/device-auth-client";

const LOAD_TIMEOUT_MS = 20_000;

export type WalletRole = "owner" | "visitor";

export type TokenHomeRenderArgs = {
  token: PhygitalToken;
  liveConfirmed?: boolean;
  role: WalletRole;
  linkStatus?: LinkStatus;
};

function layoutForToken(token: PhygitalToken): ShellLayout {
  return tokenHasLinkedMint(token) ? "gallery" : "compact";
}

/** Device-session + possession gated token home (parent owns DeviceLoginGate). */
export function TokenAddressRoute({
  tokenAddress,
  renderHome,
}: {
  tokenAddress: string;
  renderHome: (args: TokenHomeRenderArgs) => ReactNode;
}) {
  return (
    <TokenAddressRouteInner
      tokenAddress={tokenAddress}
      renderHome={renderHome}
    />
  );
}

function TokenAddressRouteInner({
  tokenAddress,
  renderHome,
}: {
  tokenAddress: string;
  renderHome: (args: TokenHomeRenderArgs) => ReactNode;
}) {
  const isRestoring = useIsRestoring();
  const tokenQuery = usePhygitalTokenByAddress(tokenAddress);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  const token = hydrated && !isRestoring ? tokenQuery.data : undefined;
  const mint = token && tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);

  const linkStatus = useQuery({
    queryKey: queryKeys.deviceAuth.linkStatus(tokenAddress),
    queryFn: () => fetchLinkStatus(tokenAddress),
    enabled: Boolean(token),
    ...queryOptions.deviceLinks,
  });

  const [possessionOk, setPossessionOk] = useState(false);
  const [linkSkipped, setLinkSkipped] = useState(false);

  // NFC possession token or cold-Hold accessory proof — skip a second Hold.
  useEffect(() => {
    if (hasFreshPossession(tokenAddress)) setPossessionOk(true);
  }, [tokenAddress]);

  const isOwner = linkStatus.data === "linked_here";
  const unlocked =
    Boolean(token) &&
    (isOwner ||
      possessionOk ||
      (linkStatus.data === "unlinked" && linkSkipped));

  const role: WalletRole = isOwner ? "owner" : "visitor";

  const layout: ShellLayout =
    unlocked && token ? layoutForToken(token) : "compact";
  const waitingToken =
    !hydrated ||
    isRestoring ||
    (!token &&
      (tokenQuery.isPending ||
        tokenQuery.isLoading ||
        tokenQuery.isFetching));
  const waitingLink = Boolean(token) && linkStatus.isPending && !unlocked;
  const waiting = waitingToken || waitingLink;
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!waiting) {
      setTimedOut(false);
      return;
    }
    const id = window.setTimeout(() => setTimedOut(true), LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [waiting]);

  const showLinkPrompt =
    Boolean(token) &&
    possessionOk &&
    linkStatus.data === "unlinked" &&
    !linkSkipped;

  return (
    <TokenRouteShell layout={layout}>
      {unlocked && token && !showLinkPrompt ? (
        renderHome({
          token,
          liveConfirmed: true,
          role,
          linkStatus: linkStatus.data,
        })
      ) : waiting && !timedOut ? (
        <NfcHoldStatus
          size="lg"
          pulsing
          busy
          imageSrc={collectible?.image}
          imageAlt={collectible?.name ?? ""}
          title={copy.verify.verifyingChip}
        />
      ) : showLinkPrompt && token ? (
        <LinkPrompt
          token={token}
          tokenAddress={tokenAddress}
          onLinked={() => {
            setLinkSkipped(false);
          }}
          onSkip={() => setLinkSkipped(true)}
        />
      ) : token && !isOwner ? (
        <AddressHoldGate
          token={token}
          tokenAddress={tokenAddress}
          onPossessed={() => setPossessionOk(true)}
          checkError={
            linkStatus.isError ? toUserErrorMessage(linkStatus.error) : null
          }
        />
      ) : (
        <GateMessage
          icon={<Nfc className="size-5 text-muted-foreground" />}
          title={timedOut ? copy.verify.loadTimedOut : copy.token.itemLoadFailed}
          body={
            timedOut
              ? copy.verify.loadTimedOutBody
              : toUserErrorMessage(
                  tokenQuery.error,
                  copy.token.itemNotOnChain,
                )
          }
          action={
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={() => {
                setTimedOut(false);
                void tokenQuery.refetch();
                void linkStatus.refetch();
              }}
            >
              {copy.common.tryAgain}
            </Button>
          }
        />
      )}
    </TokenRouteShell>
  );
}

function LinkPrompt({
  token,
  tokenAddress,
  onLinked,
  onSkip,
}: {
  token: PhygitalToken;
  tokenAddress: string;
  onLinked: () => void;
  onSkip: () => void;
}) {
  const queryClient = useQueryClient();
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doLink() {
    setError(null);
    setBusy(true);
    const meta = {
      label: collectible?.name ?? null,
      imageUrl: collectible?.image ?? null,
      mint,
    };
    try {
      const tapToken = peekPossessionToken(tokenAddress);
      const accessoryProof = peekAccessoryProof(tokenAddress);

      if (tapToken) {
        try {
          await linkToken({
            phygitalToken: tokenAddress,
            possessionToken: tapToken,
            ...meta,
          });
          clearAllPossession(tokenAddress);
        } catch (e) {
          const possessionFailed =
            e instanceof QueryHttpError && e.code === "possession_invalid";
          if (!possessionFailed) throw e;
          clearPossessionToken(tokenAddress);
          const accessory =
            accessoryProof ?? (await holdAccessoryAuth());
          await linkToken({
            phygitalToken: tokenAddress,
            accessory,
            ...meta,
          });
          clearAllPossession(tokenAddress);
        }
      } else if (accessoryProof) {
        await linkToken({
          phygitalToken: tokenAddress,
          accessory: accessoryProof,
          ...meta,
        });
        clearAllPossession(tokenAddress);
      } else {
        await linkToken({
          phygitalToken: tokenAddress,
          accessory: await holdAccessoryAuth(),
          ...meta,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.deviceAuth.all(),
      });
      onLinked();
    } catch (e) {
      setError(toUserErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (busy) {
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

  return (
    <NfcHoldStatus
      size="lg"
      pulsing={false}
      imageSrc={collectible?.image}
      imageAlt={collectible?.name ?? ""}
      title={error ? copy.verify.failed : copy.wallet.deviceLinkTitle}
      body={error ?? copy.wallet.deviceLinkBody}
      action={
        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => void doLink()}
          >
            {error ? copy.common.tryAgain : copy.wallet.deviceLinkCta}
          </Button>
          {!error ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={onSkip}
            >
              {copy.wallet.deviceLinkSkip}
            </Button>
          ) : null}
        </div>
      }
    />
  );
}

function AddressHoldGate({
  token,
  tokenAddress,
  onPossessed,
  checkError,
}: {
  token: PhygitalToken;
  tokenAddress: string;
  onPossessed: () => void;
  checkError: string | null;
}) {
  const mint = tokenHasLinkedMint(token) ? String(token.mint) : null;
  const { collectible } = useResolvedDasCollectible(mint);
  const accessory = useAccessoryHold();

  async function holdToOpen() {
    const auth = await accessory.hold({
      expectedPublicKey: token.secp256r1PublicKey,
    });
    if (!auth) return;
    try {
      const pda = String(await findPhygitalTokenPda(auth.secp256r1PublicKey));
      if (pda !== tokenAddress) {
        throw new Error(copy.token.wrongItem);
      }
      storeAccessoryProof(tokenAddress, {
        message: auth.message,
        response: auth.response,
      });
      onPossessed();
    } catch (err) {
      accessory.setError(toUserErrorMessage(err, copy.verify.failedBody));
    }
  }

  if (accessory.showInAppGate) {
    return <InAppBrowserGate body={copy.gate.openInBrowserBody} />;
  }

  if (accessory.holding) {
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

  const error = accessory.error ?? checkError;

  return (
    <NfcHoldStatus
      size="lg"
      pulsing={!error}
      imageSrc={collectible?.image}
      imageAlt={collectible?.name ?? ""}
      title={error ? copy.verify.failed : copy.home.holdTitle}
      body={error ?? copy.home.holdBody}
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
