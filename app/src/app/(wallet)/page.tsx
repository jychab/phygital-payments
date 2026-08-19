import type { Metadata } from "next";

import { HomeApp } from "@/components/wallet-client-apps";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Manage NFC devices and tap-to-pay",
};


export default async function Home() {
  return <HomeApp />;
}
