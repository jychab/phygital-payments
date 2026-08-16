import type { Metadata } from "next";

import { PayHomeApp } from "@/components/pay-home-app";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Manage NFC devices and tap-to-pay",
};


export default async function Home() {
  return <PayHomeApp />;
}
