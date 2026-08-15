import type { Metadata } from "next";

import { AssetsHomeApp } from "@/components/assets-home-app";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Manage NFC devices and tap-to-pay",
};


export default async function Home() {
  return <AssetsHomeApp />;
}
