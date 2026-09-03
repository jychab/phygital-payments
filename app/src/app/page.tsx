import type { Metadata } from "next";

import { RecentsHome } from "@/components/home/recents-home";
import { products } from "@/lib/copy/phygital";

export const metadata: Metadata = {
  title: products.recents.name,
  description: products.recents.tagline,
};

export default function Home() {
  return <RecentsHome />;
}
