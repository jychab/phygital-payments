import type { Metadata } from "next";

import { AppProviders } from "./providers";
import { brand, products } from "@/lib/copy/phygital";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: brand.company,
    template: `%s — ${brand.company}`,
  },
  description: products.collection.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
