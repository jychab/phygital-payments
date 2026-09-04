import type { Metadata } from "next";

import { OwnedHome } from "@/components/home/owned-home";
import { products } from "@/lib/copy/phygital";

export const metadata: Metadata = {
  title: products.home.name,
  description: products.home.tagline,
};

export default function Home() {
  return <OwnedHome />;
}
