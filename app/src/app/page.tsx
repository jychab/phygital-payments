import type { Metadata } from "next";

import { HomeApp } from "@/components/home/home-app";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Manage NFC devices and tap-to-pay",
};

export default function Home() {
  return <HomeApp />;
}
