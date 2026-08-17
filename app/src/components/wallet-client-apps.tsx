"use client";

import dynamic from "next/dynamic";

import { EmbedBoot } from "@/components/embed-error";

const loading = () => <EmbedBoot />;

/**
 * Wallet-route apps that import `@privy-io/react-auth`. Loaded with `ssr: false`
 * so the Privy SDK is never evaluated during SSR / in the OpenNext worker.
 */
export const PayHomeApp = dynamic(
  () => import("@/components/pay-home-app").then((m) => m.PayHomeApp),
  { ssr: false, loading },
);

export const SetupCollectApp = dynamic(
  () =>
    import("@/components/setup-collect-app").then((m) => m.SetupCollectApp),
  { ssr: false, loading },
);

export const FinishClaimApp = dynamic(
  () =>
    import("@/components/finish-claim-panel").then((m) => m.FinishClaimApp),
  { ssr: false, loading },
);
