"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { address } from "@solana/kit";
import { toast } from "sonner";
import {
  buildClearTokenVerifierChallenge,
  buildSetTokenVerifierChallenge,
  getClearTokenVerifierInstructions,
  getSetTokenVerifierInstructions,
} from "phygital-wallet-sdk";
import {
  authenticatePasskeyForSecp256r1Verify,
  buildSecp256r1VerifyInstruction,
} from "phygital-token-sdk";

import { NfcHoldStatus } from "@/components/shared/nfc-hold-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copy } from "@/lib/copy/phygital";
import { getSolanaRpc } from "@/lib/solana/rpc";
import { sendTransaction } from "@/lib/solana/tx";
import { tryParseAddress } from "@/lib/solana/address";
import { toUserErrorMessage } from "@/lib/user-errors";
import { createAppVerifierSigner } from "@/lib/wallet/verifier-fee-payer";

type View = "menu" | "custom" | "holding" | "success";

/** Advanced signing settings — set/clear token verifier. */
export function SigningSettingsSheet({
  phygitalTokenPda,
  onClose,
}: {
  phygitalTokenPda: string;
  onClose: () => void;
}) {
  const [view, setView] = useState<View>("menu");
  const [endpoint, setEndpoint] = useState("https://");
  const [verifier, setVerifier] = useState("");

  async function saveCustom() {
    const verifierAddr = tryParseAddress(verifier.trim());
    if (!verifierAddr || !endpoint.trim().startsWith("https://")) {
      toast.error("Enter a valid verifier address and HTTPS endpoint");
      return;
    }
    setView("holding");
    try {
      const rpc = getSolanaRpc();
      const tokenPda = address(phygitalTokenPda);
      const feePayer = await createAppVerifierSigner(rpc, tokenPda);
      const { slotNumber, messageHash } = await buildSetTokenVerifierChallenge(
        rpc,
        verifierAddr,
        endpoint.trim(),
      );
      const tap = await authenticatePasskeyForSecp256r1Verify({
        rpc,
        messageHash,
      });
      const verify = await buildSecp256r1VerifyInstruction(tap);
      const instructions = await getSetTokenVerifierInstructions({
        rpc,
        payer: feePayer,
        overrideVerifier: verifierAddr,
        endpoint: endpoint.trim(),
        passkeyAuth: {
          secp256r1VerifyInstruction: verify.secp256r1VerifyInstruction,
          phygitalTokenPda: verify.phygitalTokenPda,
          secp256r1VerifyArgs: verify.secp256r1VerifyArgs,
          slotNumber,
        },
      });
      const { confirmed } = await sendTransaction({
        instructions,
        feePayer,
      });
      await confirmed;
      setView("success");
      toast.success("Signing service updated");
    } catch (e) {
      setView("custom");
      toast.error(toUserErrorMessage(e));
    }
  }

  async function restoreDefault() {
    setView("holding");
    try {
      const rpc = getSolanaRpc();
      const tokenPda = address(phygitalTokenPda);
      const feePayer = await createAppVerifierSigner(rpc, tokenPda);
      const { slotNumber, messageHash } =
        await buildClearTokenVerifierChallenge(rpc);
      const tap = await authenticatePasskeyForSecp256r1Verify({
        rpc,
        messageHash,
      });
      const verify = await buildSecp256r1VerifyInstruction(tap);
      const instructions = await getClearTokenVerifierInstructions({
        rpc,
        passkeyAuth: {
          secp256r1VerifyInstruction: verify.secp256r1VerifyInstruction,
          phygitalTokenPda: verify.phygitalTokenPda,
          secp256r1VerifyArgs: verify.secp256r1VerifyArgs,
          slotNumber,
        },
      });
      const { confirmed } = await sendTransaction({
        instructions,
        feePayer,
      });
      await confirmed;
      setView("success");
      toast.success("Restored Revibase signing");
    } catch (e) {
      setView("menu");
      toast.error(toUserErrorMessage(e));
    }
  }

  if (view === "holding" || view === "success") {
    return (
      <div className="flex flex-1 flex-col">
        <Button type="button" variant="ghost" size="sm" className="self-start" onClick={onClose}>
          {copy.common.cancel}
        </Button>
        <NfcHoldStatus
          size="lg"
          pulsing={view === "holding"}
          busy={view === "holding"}
          tone={view === "success" ? "success" : "default"}
          title={view === "success" ? copy.common.done : copy.wallet.holdToSave}
          body={view === "success" ? undefined : copy.verify.holdStillBody}
          action={
            view === "success" ? (
              <Button type="button" size="lg" className="w-full" onClick={onClose}>
                {copy.common.done}
              </Button>
            ) : undefined
          }
        />
      </div>
    );
  }

  if (view === "custom") {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={() => setView("menu")}>
            {copy.common.back}
          </Button>
          <p className="text-sm font-medium">{copy.wallet.signing}</p>
          <span className="w-16" aria-hidden />
        </div>
        <label className="text-xs text-muted-foreground">{copy.wallet.customVerifier}</label>
        <Input
          value={verifier}
          onChange={(e) => setVerifier(e.target.value)}
          placeholder="Verifier pubkey"
          className="font-mono text-sm"
        />
        <label className="text-xs text-muted-foreground">{copy.wallet.customEndpoint}</label>
        <Input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="https://"
          className="font-mono text-sm"
        />
        <Button type="button" size="lg" className="mt-auto" onClick={() => void saveCustom()}>
          {copy.wallet.holdToSave}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {copy.common.back}
        </Button>
        <p className="text-sm font-medium">{copy.wallet.signing}</p>
        <span className="w-16" aria-hidden />
      </div>
      <p className="text-sm text-muted-foreground">{copy.wallet.signingBody}</p>
      <div className="rounded-2xl bg-muted/25 px-4 py-3">
        <p className="text-xs text-muted-foreground">{copy.wallet.signingCurrent}</p>
        <p className="text-sm font-medium">{copy.wallet.signingDefault}</p>
      </div>
      <button
        type="button"
        onClick={() => setView("custom")}
        className="flex items-center justify-between rounded-2xl bg-muted/25 px-4 py-4 text-left"
      >
        <span className="text-sm">{copy.wallet.useCustomSigning}</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </button>
      <Button type="button" variant="outline" onClick={() => void restoreDefault()}>
        Restore Revibase
      </Button>
    </div>
  );
}
