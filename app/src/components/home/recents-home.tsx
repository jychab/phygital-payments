"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { GroupedList } from "@/components/shared/grouped-list";
import { IdentityChip } from "@/components/shared/identity-chip";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import {
  initWebauthnSessionSnapshot,
  markWebauthnVerified,
} from "@/hooks/token/use-webauthn-session";
import { copy } from "@/lib/copy/phygital";
import { queryKeys, queryOptions } from "@/lib/queries";
import { fetchDasCollectiblesClient } from "@/lib/tokens/das-collectible-client";
import { toUserErrorMessage } from "@/lib/user-errors";
import { galleryAnimate } from "@/lib/motion";
import { cn, shortAddress } from "@/lib/utils";
import {
  EMPTY_RECENTS,
  listRecents,
  type RecentItem,
} from "@/lib/wallet/recents";
import {
  fetchActiveTokenSession,
  mintTokenSessionViaHold,
} from "@/lib/wallet/token-session";

function subscribe(onStoreChange: () => void) {
  const onFocus = () => onStoreChange();
  const onCustom = () => onStoreChange();
  window.addEventListener("focus", onFocus);
  window.addEventListener("revibase:recents", onCustom);
  return () => {
    window.removeEventListener("focus", onFocus);
    window.removeEventListener("revibase:recents", onCustom);
  };
}

function getSnapshot() {
  return listRecents();
}

function getServerSnapshot() {
  return EMPTY_RECENTS;
}

type ReopenPhase = "idle" | "checking" | "hold" | "holding";

/** Device-local Recents hub — reopen via session cookie, or hold again. */
export function RecentsHome() {
  const router = useRouter();
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const latest = items[0];
  const mintsNeedingDas = useMemo(
    () =>
      [
        ...new Set(
          items
            .filter((item) => item.mint?.trim() && !item.imageUrl)
            .map((item) => item.mint!.trim()),
        ),
      ].sort(),
    [items],
  );
  const queryClient = useQueryClient();
  const dasBatch = useQuery({
    queryKey: queryKeys.dasCollectible.batch(mintsNeedingDas),
    queryFn: async () => {
      const batch = await fetchDasCollectiblesClient(mintsNeedingDas);
      for (const [mint, collectible] of Object.entries(batch)) {
        queryClient.setQueryData(
          queryKeys.dasCollectible.byMint(mint),
          collectible,
        );
      }
      return batch;
    },
    enabled: mintsNeedingDas.length > 0,
    ...queryOptions.stable,
  });

  const [phase, setPhase] = useState<ReopenPhase>("idle");
  const [active, setActive] = useState<RecentItem | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerExtra = useMemo(() => {
    if (!latest?.walletAddress) return null;
    return (
      <IdentityChip walletAddress={latest.walletAddress} mode="copy" />
    );
  }, [latest?.walletAddress]);

  function enterToken(secp256r1PublicKey: string) {
    initWebauthnSessionSnapshot();
    markWebauthnVerified(secp256r1PublicKey);
    router.push("/token");
  }

  async function openRecent(item: RecentItem) {
    setActive(item);
    setError(null);
    setSessionExpired(false);
    setPhase("checking");
    try {
      const session = await fetchActiveTokenSession(item.tokenAddress);
      if (session && session.phygitalToken === item.tokenAddress) {
        enterToken(session.secp256r1PublicKey);
        return;
      }
      // Cookie missing/expired for this accessory — hold again. Other
      // accessories keep their own cookies.
      setSessionExpired(!session);
      setPhase("hold");
    } catch (e) {
      setError(toUserErrorMessage(e));
      setPhase("hold");
    }
  }

  async function holdToOpen() {
    if (!active) return;
    setError(null);
    setPhase("holding");
    try {
      const session = await mintTokenSessionViaHold();
      if (session.phygitalToken !== active.tokenAddress) {
        throw new Error(copy.recents.wrongItem);
      }
      enterToken(session.secp256r1PublicKey);
    } catch (e) {
      toast.error(toUserErrorMessage(e, copy.verify.failedBody));
      setError(toUserErrorMessage(e, copy.verify.failedBody));
      setPhase("hold");
    }
  }

  if (phase === "checking" || phase === "holding") {
    return (
      <AppShell layout="compact">
        <NfcHoldStatus
          size="lg"
          busy
          imageSrc={active?.imageUrl}
          title={
            phase === "checking" ? copy.common.loading : copy.verify.holdStill
          }
          body={
            phase === "checking" ? undefined : copy.verify.holdStillBody
          }
        />
      </AppShell>
    );
  }

  if (phase === "hold" && active) {
    return (
      <AppShell layout="compact">
        <NfcHoldStatus
          size="lg"
          imageSrc={active.imageUrl}
          title={
            sessionExpired
              ? copy.recents.reopenSessionExpiredTitle
              : error
                ? copy.verify.failed
                : copy.recents.reopenHoldTitle
          }
          body={
            error ??
            (sessionExpired
              ? copy.recents.reopenSessionExpiredBody
              : copy.recents.reopenHoldBody)
          }
          action={
            <div className="flex w-full flex-col gap-2">
              <Button
                type="button"
                size="lg"
                className="w-full"
                onClick={() => void holdToOpen()}
              >
                {error ? copy.common.tryAgain : copy.verify.holdToCheck}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  setPhase("idle");
                  setActive(null);
                  setError(null);
                }}
              >
                {copy.common.cancel}
              </Button>
            </div>
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell layout="compact" headerExtra={headerExtra}>
      <div className="flex flex-1 flex-col gap-5">
        <h1 className={cn("text-large-title", galleryAnimate.rise)}>
          {copy.recents.heading}
        </h1>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
            <p className="text-base font-semibold">{copy.recents.emptyTitle}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {copy.recents.emptyBody}
            </p>
          </div>
        ) : (
          <GroupedList>
            {items.map((item) => (
              <li
                key={item.tokenAddress}
                className="border-b border-border/50 last:border-b-0"
              >
                <RecentRow
                  item={item}
                  das={
                    item.mint?.trim()
                      ? (dasBatch.data?.[item.mint.trim()] ?? null)
                      : null
                  }
                  onOpen={() => void openRecent(item)}
                />
              </li>
            ))}
          </GroupedList>
        )}
      </div>
    </AppShell>
  );
}

function RecentRow({
  item,
  das,
  onOpen,
}: {
  item: RecentItem;
  das: { image: string | null; name: string } | null;
  onOpen: () => void;
}) {
  const imageUrl = das?.image ?? item.imageUrl ?? null;
  const label = das?.name ?? item.label;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 active:bg-muted/70 focus-visible:bg-muted/50 focus-visible:outline-none"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="size-11 rounded-xl object-cover"
        />
      ) : (
        <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground">
          {item.kind === "card" ? "C" : "A"}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="truncate text-xs tabular-nums text-muted-foreground">
          {shortAddress(item.walletAddress, 4)}
        </p>
      </div>
    </button>
  );
}
