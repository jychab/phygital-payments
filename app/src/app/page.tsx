import type { Metadata } from "next";

import { HomeApp } from "@/components/home/home-app";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Tap to pay with your device",
};

export default function Home() {
  return <HomeApp />;
}
