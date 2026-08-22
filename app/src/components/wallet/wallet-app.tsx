"use client";

import { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";

import { PhygitalAppShell } from "@/components/phygital/phygital-app-shell";
import { ClaimPanel } from "@/components/phygital/claim-panel";
import { OwnedByOtherPanel } from "@/components/phygital/owned-by-other-panel";
import { PhygitalTokenGate } from "@/components/phygital/phygital-token-gate";
import { AuthGate } from "@/components/wallet/auth-gate";
import { AgentSetupSheet } from "@/components/wallet/agent-setup-sheet";
import { HoldingsSheet } from "@/components/wallet/holdings-sheet";
import { ReceiveSheet } from "@/components/wallet/receive-sheet";
import { SendSheet } from "@/components/wallet/send-sheet";
import { TaskSetupSheet } from "@/components/wallet/task-setup-sheet";
import { WalletHome } from "@/components/wallet/wallet-home";
import { WalletSettings } from "@/components/wallet/wallet-settings";
import { CheckingStatus, GateMessage } from "@/components/layout/gate-message";
import { BackLink } from "@/components/shared/back-link";
import { NfcTapVerifiedGate } from "@/components/shared/nfc-tap-verified-gate";
import { useTapVerify } from "@/hooks/phygital/use-tap-verify";
import { useSmartWallet } from "@/hooks/wallet/use-smart-wallet";
import { phygitalTapView } from "@/lib/phygital/home-view";
import type { PhygitalToken } from "@/lib/phygital/token";
import type { ParsedTask } from "@/lib/wallet/parse-task";

type Screen =
  | "home"
  | "send"
  | "receive"
  | "automate"
  | "holdings"
  | "settings"
  | "agent";

export function WalletApp() {
  return (
    <PhygitalAppShell modeLabel="Wallet">
      <AuthGate>
        <WalletSignedIn />
      </AuthGate>
    </PhygitalAppShell>
  );
}

function WalletSignedIn() {
  const { session } = useSmartWallet();
  const { hasTapProof } = useTapVerify();

  if (hasTapProof) {
    if (!session) return <CheckingStatus />;
    return (
      <NfcTapVerifiedGate>
        {(pk) => (
          <PhygitalTokenGate pk={pk}>
            {(token) => <WalletWithPhygital token={token} />}
          </PhygitalTokenGate>
        )}
      </NfcTapVerifiedGate>
    );
  }

  return <WalletScreens token={null} />;
}

function WalletWithPhygital({ token }: { token: PhygitalToken }) {
  const { session } = useSmartWallet();
  const [openAgent, setOpenAgent] = useState(false);

  if (!session) return <CheckingStatus />;

  const branch = phygitalTapView(token, session.vaultPda);

  if (branch === "claim") {
    if (!openAgent) {
      return (
        <ClaimPanel
          token={token}
          unclaimed
          onClaimed={() => setOpenAgent(true)}
        />
      );
    }
    return <WalletScreens token={token} initialScreen="agent" />;
  }

  if (branch === "foreign-owner") {
    return <OwnedByOtherPanel owner={String(token.currentOwner)} />;
  }

  if (branch === "unsupported") {
    return (
      <GateMessage
        icon={<CircleAlert className="size-5 text-muted-foreground" />}
        title="Not a wallet phygital"
        body="This phygital token isn’t set up for this app."
      />
    );
  }

  return <WalletScreens token={token} />;
}

function WalletScreens({
  token,
  initialScreen,
}: {
  token: PhygitalToken | null;
  initialScreen?: Screen;
}) {
  const { session } = useSmartWallet();
  const [screen, setScreen] = useState<Screen>(initialScreen ?? "home");
  const [sendPrompt, setSendPrompt] = useState("");
  const [taskDraft, setTaskDraft] = useState<ParsedTask | null>(null);

  useEffect(() => {
    if (initialScreen) setScreen(initialScreen);
  }, [initialScreen]);

  if (screen === "send") {
    return <SendSheet prompt={sendPrompt} onBack={() => setScreen("home")} />;
  }

  if (screen === "receive") {
    return <ReceiveSheet onBack={() => setScreen("home")} />;
  }

  if (screen === "automate") {
    return (
      <TaskSetupSheet
        draft={taskDraft}
        onBack={() => setScreen("home")}
        onDone={() => setScreen("home")}
      />
    );
  }

  if (screen === "holdings") {
    return <HoldingsSheet onBack={() => setScreen("home")} />;
  }

  if (screen === "settings") {
    return <WalletSettings onBack={() => setScreen("home")} />;
  }

  if (screen === "agent") {
    if (!token) {
      return (
        <div className="flex flex-1 flex-col">
          <BackLink onClick={() => setScreen("home")} />
          <GateMessage
            icon={<CircleAlert className="size-5 text-muted-foreground" />}
            title="Hold your phygital first"
            body="Claim it to this wallet, then you can allow other apps to use it."
          />
        </div>
      );
    }
    return (
      <AgentSetupSheet
        phygitalPasskey={token.secp256r1PublicKey}
        onBack={() => setScreen("home")}
        onDone={() => setScreen("home")}
      />
    );
  }

  return (
    <WalletHome
      token={token}
      onSend={(prompt) => {
        setSendPrompt(prompt);
        setScreen("send");
      }}
      onReceive={() => setScreen("receive")}
      onAutomate={(draft) => {
        setTaskDraft(draft ?? null);
        setScreen("automate");
      }}
      onSettings={() => setScreen("settings")}
      onHoldings={() => setScreen("holdings")}
      onAllowApps={() => setScreen("agent")}
      onTaskDraft={setTaskDraft}
    />
  );
}
