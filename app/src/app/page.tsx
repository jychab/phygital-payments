import dynamic from "next/dynamic";
import { Suspense } from "react";

import { AppBoot } from "@/components/layout/app-shell";

const WalletApp = dynamic(
  () => import("@/components/wallet/wallet-app").then((m) => m.WalletApp),
  { loading: () => <AppBoot modeLabel="Wallet" /> },
);

export default function Home() {
  return (
    <Suspense fallback={<AppBoot modeLabel="Wallet" />}>
      <WalletApp />
    </Suspense>
  );
}
