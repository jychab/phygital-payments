"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { GroupedList, GroupedRow } from "@/components/shared/grouped-list";
import { LoadingStatus } from "@/components/shared/loading-status";
import { DeviceLoginGate } from "@/components/wallet/device-login-gate";
import { Button } from "@/components/ui/button";
import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { copy } from "@/lib/copy/phygital";
import { homeSectionsClass, touchTargetClass } from "@/lib/layout";
import { queryKeys, queryOptions } from "@/lib/queries";
import { galleryAnimate } from "@/lib/motion";
import { cn, shortAddress } from "@/lib/utils";
import { toUserErrorMessage } from "@/lib/user-errors";
import { authenticateToken } from "@/lib/token/authenticate";
import { findPhygitalTokenPda } from "phygital-token-sdk";
import {
  fetchDeviceLinks,
  linkToken,
  type DeviceLink,
} from "@/lib/wallet/device-auth-client";
import { tokenHomeHref } from "@/lib/wallet/token-home-href";

/** Signed-in home: server-backed owned token links. */
export function OwnedHome() {
  return (
    <AppShell layout="home">
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

  const addAccessory = useMutation({
    mutationFn: async () => {
      const auth = await authenticateToken();
      const pda = String(await findPhygitalTokenPda(auth.secp256r1PublicKey));
      // linkToken is idempotent for linked_here (returns early server-side).
      await linkToken({
        phygitalToken: pda,
        accessory: { message: auth.message, response: auth.response },
      });
      queryClient.setQueryData(
        queryKeys.deviceAuth.linkStatus(pda),
        "linked_here" as const,
      );
      queryClient.setQueryData(
        queryKeys.deviceAuth.links(),
        (prev: DeviceLink[] | undefined) => {
          if (!prev) return prev;
          if (prev.some((l) => l.phygitalToken === pda)) return prev;
          return [
            ...prev,
            {
              phygitalToken: pda,
              label: null,
              imageUrl: null,
              mint: null,
              linkedAt: Date.now(),
            },
          ];
        },
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.deviceAuth.links(),
      });
      return pda;
    },
    onSuccess: (pda) => {
      router.push(tokenHomeHref(pda));
    },
  });

  if (addAccessory.isPending) {
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

  if (links.isLoading) {
    return <LoadingStatus />;
  }

  const items = links.data ?? [];
  const error = addAccessory.error
    ? toUserErrorMessage(addAccessory.error)
    : null;

  if (items.length === 0) {
    return (
      <NfcHoldStatus
        size="lg"
        pulsing={false}
        title={copy.home.emptyTitle}
        body={error ?? copy.home.emptyBody}
        action={
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => addAccessory.mutate()}
          >
            {copy.wallet.deviceAddAccessory}
          </Button>
        }
      />
    );
  }

  const cards = items.filter((item) => Boolean(item.mint));
  const accessories = items.filter((item) => !item.mint);
  const bothKinds = cards.length > 0 && accessories.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="default"
          className={touchTargetClass}
          onClick={() => addAccessory.mutate()}
        >
          {copy.wallet.deviceAddAccessory}
        </Button>
      </div>

      {error ? (
        <p className="px-1 text-sm text-muted-foreground">{error}</p>
      ) : null}

      <div
        className={cn(
          galleryAnimate.rise,
          bothKinds ? homeSectionsClass : "flex flex-col gap-6",
        )}
      >
        {cards.length > 0 ? (
          <FormFactorSection
            label={copy.home.cards}
            items={cards}
            onOpen={(token) => router.push(tokenHomeHref(token))}
          />
        ) : null}
        {accessories.length > 0 ? (
          <FormFactorSection
            label={copy.home.accessories}
            items={accessories}
            onOpen={(token) => router.push(tokenHomeHref(token))}
          />
        ) : null}
      </div>
    </div>
  );
}

function FormFactorSection({
  label,
  items,
  onOpen,
}: {
  label: string;
  items: DeviceLink[];
  onOpen: (phygitalToken: string) => void;
}) {
  return (
    <GroupedList label={label}>
      {items.map((item) => {
        const kind = item.mint ? copy.home.card : copy.home.accessory;
        const name = item.label?.trim() || kind;
        return (
          <GroupedRow
            key={item.phygitalToken}
            onClick={() => onOpen(item.phygitalToken)}
            leading={
              item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="size-11 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/40 text-xs font-medium text-muted-foreground"
                  aria-hidden
                >
                  {(name.trim().charAt(0) || "?").toUpperCase()}
                </span>
              )
            }
            subtitle={shortAddress(item.phygitalToken, 4)}
          >
            {name}
          </GroupedRow>
        );
      })}
    </GroupedList>
  );
}
