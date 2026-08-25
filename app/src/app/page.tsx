import type { Metadata } from "next";

import { HomeApp } from "@/components/home/home-app";
import { products } from "@/lib/copy/phygital";

export const metadata: Metadata = {
  title: products.collection.name,
  description: products.collection.tagline,
};

export default function Home() {
  return <HomeApp />;
}
