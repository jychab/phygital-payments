import type { Metadata } from "next";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phygital Pay",
  description: "Set a USDC allowance, then get paid with a phygital pass tap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Type is served from the Apple system stack (SF Pro on Apple platforms) via
  // CSS variables in globals.css — native, trustworthy, and no font fetch/FOUT.
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
