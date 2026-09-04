"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { RouteBoot } from "@/components/layout/route-boot";
import {
  TokenAddressRoute,
  type WalletRole,
} from "@/components/token/token-address-route";
import { TokenMintedHome } from "@/components/token/token-minted-home";
import { TokenNfcApp } from "@/components/token/token-nfc-app";
import { TokenUnmintedHome } from "@/components/token/token-unminted-home";
import { DeviceLoginGate } from "@/components/wallet/device-login-gate";
import { copy } from "@/lib/copy/phygital";
import {
  tokenHasLinkedMint,
  type PhygitalToken,
} from "@/lib/phygital/token";
import type { LinkStatus } from "@/lib/wallet/device-auth-client";

const TokenRouteShell = dynamic(
  () =>
    import("@/components/token/token-route-shell").then(
      (m) => m.TokenRouteShell,
    ),
  { ssr: false, loading: () => <RouteBoot /> },
);

const TOKEN_NFC_COPY = {
  inAppCheck: copy.gate.openInBrowserBody,
  holdBody: copy.verify.introBody,
};

function TokenHome({
  token,
  role,
  linkStatus,
}: {
  token: PhygitalToken;
  role: WalletRole;
  linkStatus?: LinkStatus;
}): ReactNode {
  if (tokenHasLinkedMint(token)) {
    return (
      <TokenMintedHome token={token} role={role} linkStatus={linkStatus} />
    );
  }
  return (
    <TokenUnmintedHome token={token} role={role} linkStatus={linkStatus} />
  );
}

/**
 * Route `/token` — one device login gate; tap verify runs in parallel with
 * session check on cold NFC entry.
 */
export function TokenApp() {
  const searchParams = useSearchParams();
  const address = searchParams.get("address")?.trim() ?? "";

  return (
    <DeviceLoginGate keepMounted={!address}>
      {address ? (
        <TokenAddressRoute
          tokenAddress={address}
          renderHome={({ token, role, linkStatus }) => (
            <TokenHome
              token={token}
              role={role}
              linkStatus={linkStatus}
            />
          )}
        />
      ) : (
        <TokenRouteShell layout="compact">
          <TokenNfcApp nfcCopy={TOKEN_NFC_COPY} />
        </TokenRouteShell>
      )}
    </DeviceLoginGate>
  );
}
