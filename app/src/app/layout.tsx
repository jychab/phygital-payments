import type { Metadata } from "next";

import { AppProviders } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Enable tap-to-pay on your NFC device, then get paid with a phygital tap",
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
