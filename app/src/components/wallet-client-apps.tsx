"use client";

import dynamic from "next/dynamic";

import { EmbedBoot } from "@/components/layout/embed-gate";

const loading = () => <EmbedBoot />;

/**
 * Privy wallet apps. `ssr: false` so `@privy-io/react-auth` never runs in SSR
 * or the OpenNext worker. Public routes import their `*-app` files directly.
 *
 *   `/`              home/home-app          HomeApp          (this file)
 *   `/setup`         collect/setup-app      SetupCollectApp  (this file)
 *   `/device/finish` device/finish-app      DeviceFinishApp  (this file)
 *   `/collect`       collect/collect-app    CollectApp       (page import)
 *   `/device`        device/tap-app         DeviceTapApp     (page import)
 *
 * `lib/` and `hooks/` use the same folder names (pay, collect, device, home).
 */
export const HomeApp = dynamic(
  () => import("@/components/home/home-app").then((m) => m.HomeApp),
  { ssr: false, loading },
);

export const SetupCollectApp = dynamic(
  () =>
    import("@/components/collect/setup-app").then((m) => m.SetupCollectApp),
  { ssr: false, loading },
);

export const DeviceFinishApp = dynamic(
  () => import("@/components/device/finish-app").then((m) => m.DeviceFinishApp),
  { ssr: false, loading },
);
