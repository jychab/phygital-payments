import type { Metadata, Viewport } from "next";

import { AppProviders } from "./providers";
import { brand, products } from "@/lib/copy/phygital";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: brand.company,
    template: `%s — ${brand.company}`,
  },
  description: products.recents.tagline,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1c1d20",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark min-h-dvh antialiased">
      <body className="flex min-h-dvh flex-col font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
