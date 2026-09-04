import type { MetadataRoute } from "next";

import { brand, products } from "@/lib/copy/phygital";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.company,
    short_name: brand.company,
    description: products.home.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#f2f2f4",
    theme_color: "#f2f2f4",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
