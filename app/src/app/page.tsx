import { Suspense } from "react";

import { WalletApp } from "@/components/wallet/wallet-app";
import { AppBoot } from "@/components/layout/app-shell";

export default function Home() {
  return (
    <Suspense fallback={<AppBoot modeLabel="Wallet" />}>
      <WalletApp />
    </Suspense>
  );
}
