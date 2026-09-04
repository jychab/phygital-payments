"use client";

import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { GroupedList } from "@/components/shared/grouped-list";
import { DeviceLoginGate } from "@/components/wallet/device-login-gate";
import { Button } from "@/components/ui/button";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { copy } from "@/lib/copy/phygital";
import { queryKeys, queryOptions } from "@/lib/queries";
import { galleryAnimate } from "@/lib/motion";
import { cn, shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";
import { authenticateToken } from "@/lib/token/authenticate";
import { findPhygitalTokenPda } from "phygital-token-sdk";
import {
  fetchDeviceLinks,
  fetchLinkStatus,
  linkToken,
  type DeviceLink,
} from "@/lib/wallet/device-auth-client";
import { tokenHomeHref } from "@/lib/wallet/token-home-href";

/** Signed-in home: server-backed owned token links. */
export function OwnedHome() {
  return (
    <AppShell layout="compact">
      <DeviceLoginGate>
        <OwnedHomeInner />
      </DeviceLoginGate>
    </AppShell>
  );
}

function OwnedHomeInner() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const links = useQuery({
    queryKey: queryKeys.deviceAuth.links(),
    queryFn: fetchDeviceLinks,
    ...queryOptions.deviceLinks,
  });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addAccessory() {
    setError(null);
    setAdding(true);
    try {
      const auth = await authenticateToken();
      const pda = String(await findPhygitalTokenPda(auth.secp256r1PublicKey));
      if ((await fetchLinkStatus(pda)) === "unlinked") {
        await linkToken({
          phygitalToken: pda,
          accessory: { message: auth.message, response: auth.response },
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.deviceAuth.links(),
        });
      }
      router.push(tokenHomeHref(pda));
    } catch (e) {
      setError(toUserErrorMessage(e));
    } finally {
      setAdding(false);
    }
  }

  if (adding) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing
        busy
        title={copy.home.holdTitle}
        body={copy.home.holdBody}
      />
    );
  }

  const items = links.data ?? [];

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className={cn("text-large-title", galleryAnimate.rise)}>
          {copy.home.heading}
        </h1>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={adding}
          onClick={() => void addAccessory()}
        >
          {copy.wallet.deviceAddAccessory}
        </Button>
      </div>

      {error ? (
        <p className="px-1 text-sm text-muted-foreground">{error}</p>
      ) : null}

      {links.isLoading ? (
        <div className="flex flex-1 items-center justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-16 text-center">
          <p className="text-base font-semibold">{copy.home.emptyTitle}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {copy.wallet.deviceAddAccessoryBody}
          </p>
        </div>
      ) : (
        <GroupedList>
          {items.map((item) => (
            <li
              key={item.phygitalToken}
              className="border-b border-border/50 last:border-b-0"
            >
              <LinkRow
                item={item}
                onOpen={() => router.push(tokenHomeHref(item.phygitalToken))}
              />
            </li>
          ))}
        </GroupedList>
      )}
    </div>
  );
}

function LinkRow({
  item,
  onOpen,
}: {
  item: DeviceLink;
  onOpen: () => void;
}) {
  const label =
    item.label?.trim() ||
    (item.mint ? copy.home.card : copy.home.accessory);
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          className="size-11 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <span className="size-11 shrink-0 rounded-xl bg-muted/40" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {shortAddress(item.phygitalToken, 4)}
        </span>
      </span>
    </button>
  );
}
