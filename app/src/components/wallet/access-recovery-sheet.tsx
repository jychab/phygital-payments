"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { NavBar } from "@/components/shared/nav-bar";
import { Button } from "@/components/ui/button";
import type { WalletRole } from "@/components/token/token-address-route";
import { copy } from "@/lib/copy/phygital";
import { queryKeys } from "@/lib/queries";
import { toUserErrorMessage } from "@/lib/user-errors";
import {
  deleteDeviceCredential,
  signOutDevice,
  unlinkToken,
} from "@/lib/wallet/device-auth-client";

type AccessAction = "unlink" | "remove" | "signOut";

/** Access: unlink this accessory, remove phone (cascade), or sign out. */
export function AccessRecoverySheet({
  phygitalTokenPda,
  role,
  onBack,
}: {
  phygitalTokenPda: string;
  role: WalletRole;
  onBack: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<AccessAction | null>(null);

  async function run(kind: AccessAction) {
    setBusy(kind);
    try {
      if (kind === "unlink") {
        await unlinkToken(phygitalTokenPda);
        toast.success(copy.wallet.deviceUnlinked);
      } else if (kind === "remove") {
        await deleteDeviceCredential();
        toast.success(copy.wallet.deviceAuthRemoved);
      } else {
        await signOutDevice();
      }
      await queryClient.invalidateQueries({
        queryKey: queryKeys.deviceAuth.all(),
      });
      router.push("/");
    } catch (e) {
      toast.error(toUserErrorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <NavBar
        leading={
          <Button type="button" variant="ghost" size="sm" onClick={onBack}>
            {copy.common.back}
          </Button>
        }
        title={copy.wallet.accessAndRecovery}
      />
      <div className="space-y-2 px-1">
        <p className="text-sm font-medium">{copy.wallet.accessAndRecoveryHint}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {copy.wallet.accessAndRecoveryBody}
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {copy.wallet.deviceAuthReady}
        </p>
        {role === "owner" ? (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            disabled={busy != null}
            onClick={() => void run("unlink")}
          >
            {busy === "unlink" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              copy.wallet.deviceUnlink
            )}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={busy != null}
          onClick={() => void run("remove")}
        >
          {busy === "remove" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.deviceAuthRemove
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="w-full"
          disabled={busy != null}
          onClick={() => void run("signOut")}
        >
          {busy === "signOut" ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            copy.wallet.deviceSignOut
          )}
        </Button>
      </div>
    </div>
  );
}
