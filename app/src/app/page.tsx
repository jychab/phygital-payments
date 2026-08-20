import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { EmbedBoot } from "@/components/layout/embed-gate";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Manage NFC devices and tap-to-pay",
};

const HomeApp = dynamic(
  () => import("@/components/home/home-app").then((m) => m.HomeApp),
  { ssr: false, loading: () => <EmbedBoot /> },
);

export default function Home() {
  return <HomeApp />;
}
